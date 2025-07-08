const { Client } = require('@elastic/elasticsearch');
const { getQueryVector } = require('./nlp.service');
require('dotenv').config();

const client = new Client({
  node: process.env.ELASTICSEARCH_URL,
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD
  }
});

// Kiểm tra kết nối Elasticsearch
client.ping()
  .then(() => console.log('Kết nối Elasticsearch thành công'))
  .catch(err => console.error('Lỗi kết nối Elasticsearch:', err));

async function searchDocuments(query, type = 'keyword', page = 1, size = 10, field = 'all', fromDate, toDate, documentTypes) { // Thay đổi documentType thành documentTypes (số nhiều)
  const from = (page - 1) * size;
  let body;

  const must = [];
  const filter = [];
  const should = []; // Thêm mảng should để chứa các điều kiện tùy chọn

  // 👉 Lọc theo ngày ban hành
  if (fromDate || toDate) {
    const range = {};
    if (fromDate) range.gte = fromDate;
    if (toDate) range.lte = toDate;
    filter.push({ range: { ngay_ban_hanh: range } });
  }

  // 👉 Lọc theo loại văn bản (có thể là nhiều loại)
  if (documentTypes && documentTypes.length > 0) {
    filter.push({ terms: { loai_van_ban: documentTypes } }); // Sử dụng terms thay vì term để lọc nhiều giá trị
  }

  if (type === 'semantic') {
    const queryVector = await getQueryVector(query);

    // Ưu tiên tìm kiếm ngữ nghĩa
    should.push({
      script_score: {
        query: { match_all: {} }, // Match all documents initially, sau đó tính điểm theo ngữ nghĩa
        script: {
          source: "cosineSimilarity(params.query_vector, 'vector') + 1.0",
          params: { query_vector: queryVector }
        },
        min_score: 1.7 // Ngưỡng điểm tối thiểu cho semantic search
      }
    });

    // Kết hợp với tìm kiếm từ khóa (keyword search) để bổ sung kết quả
    // Điều này giúp tìm kiếm được cả các tài liệu chứa từ khóa liên quan
    if (query && query.trim() !== "") {
      should.push({
        multi_match: {
          query,
          fields: ['title', 'content'],
          fuzziness: 'AUTO',
          boost: 0.5 // Boost thấp hơn semantic để semantic được ưu tiên hơn
        }
      });
    }

    body = {
      from,
      size,
      query: {
        bool: {
          should,
          minimum_should_match: 1, // Ít nhất một trong các điều kiện 'should' phải khớp (semantic hoặc keyword)
          filter // Áp dụng các bộ lọc cứng (ngày, loại văn bản)
        }
      }
    };

  } else { // Keyword search
    let fields = ['title', 'content'];
    if (field === 'title') fields = ['title'];
    else if (field === 'content') fields = ['content'];

    if (query && query.trim() !== "") {
      // Tìm kiếm đa trường với độ mờ (fuzziness)
      must.push({
        multi_match: {
          query,
          fields,
          fuzziness: 'AUTO'
        }
      });

      // Ưu tiên các kết quả khớp chính xác với cụm từ (phrase search)
      should.push({
        multi_match: {
          query,
          type: "phrase",
          fields,
          boost: 2 // Tăng điểm đáng kể cho cụm từ chính xác
        }
      });

      // Ưu tiên các kết quả có từ khóa trong tiêu đề (title)
      should.push({
        match: {
          title: {
            query,
            boost: 3 // Rất quan trọng nếu từ khóa có trong tiêu đề
          }
        }
      });
    }

    // Xây dựng truy vấn cuối cùng
    const finalQuery = {
      bool: {
        must,
        filter,
        should,
        
        minimum_should_match: should.length > 0 ? 1 : 0
      }
    };

    // Nếu không có bất kỳ điều kiện tìm kiếm hay lọc nào, dùng match_all để trả về tất cả tài liệu
    if (must.length === 0 && filter.length === 0 && should.length === 0) {
      finalQuery.match_all = {}; // Thêm match_all nếu không có điều kiện nào
      delete finalQuery.bool; // Xóa bool vì không cần nữa
    }


    body = {
      from,
      size,
      query: finalQuery
    };
  }

  console.dir(body, { depth: null }); 
  return client.search({ index: 'pdf_documents3', body });
}

module.exports = { client, searchDocuments };