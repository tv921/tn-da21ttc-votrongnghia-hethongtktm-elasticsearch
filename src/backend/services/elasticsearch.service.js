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

async function searchDocuments(query, type = 'keyword', page = 1, size = 10, field = 'all', fromDate, toDate, documentType){
  const from = (page - 1) * size;
  let body;

  if (type === 'semantic') {
    const queryVector = await getQueryVector(query);
    body = {
      from,
      size,
      query: {
        script_score: {
          query: { match_all: {} },
          script: {
            source: "cosineSimilarity(params.query_vector, 'vector') + 1.0",
            params: { query_vector: queryVector }
          }
        }
      }
    };
  } else {
    // Keyword search (full-text)
    let fields = ['title', 'content'];
    if (field === 'title') fields = ['title'];
    else if (field === 'content') fields = ['content'];

    const must = [];
    const filter = [];

    // 👉 Nếu query có nội dung thì thêm multi_match
    if (query && query.trim() !== "") {
      must.push({
        multi_match: {
          query,
          fields,
          fuzziness: 'AUTO'
        }
      });
    }

    // 👉 Lọc theo ngày ban hành
    if (fromDate || toDate) {
      const range = {};
      if (fromDate) range.gte = fromDate;
      if (toDate) range.lte = toDate;
      filter.push({ range: { ngay_ban_hanh: range } });
    }

    // 👉 Lọc theo loại văn bản
    if (documentType) {
      filter.push({ term: { loai_van_ban: documentType } });
    }

    // 👉 Nếu không có query và không có filter thì dùng match_all
    const finalQuery = (must.length > 0 || filter.length > 0)
      ? { bool: { must, filter } }
      : { match_all: {} };

    body = {
      from,
      size,
      query: finalQuery
    };
  }

  console.dir(body, { depth: null });
  return client.search({ index: 'pdf_documents2', body });
}



module.exports = { client, searchDocuments};