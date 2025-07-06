const fs = require('fs');
const path = require('path');
const { client } = require('../services/elasticsearch.service');

async function getDocument(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Thiếu ID tài liệu.' });
    }

    const indicesToCheck = ['pdf_documents2'];
    for (const index of indicesToCheck) {
      try {
        const response = await client.get({ index, id });
        return res.json(response);
      } catch (err) {
        if (err.meta?.statusCode !== 404) throw err;
      }
    }

    return res.status(404).json({ error: 'Tài liệu không tìm thấy ở bất kỳ index nào.' });

  } catch (error) {
    console.error('Lỗi khi lấy tài liệu:', error);
    res.status(500).json({ error: 'Lỗi server.', details: error.message });
  }
}

async function getAllDocuments(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const from = (page - 1) * size;

    const response = await client.search({
      index: 'pdf_documents2',
      from,
      size,
      query: { match_all: {} }
    });

    res.json({
      results: response.hits.hits,
      total: response.hits.total.value,
      page,
      size
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách tài liệu:', error);
    res.status(500).json({ error: 'Không thể lấy danh sách tài liệu.' });
  }
}



async function deleteDocument(req, res) {
  const { id } = req.params;

  if (!id) return res.status(400).json({ message: 'Thiếu ID tài liệu' });

  try {
    // Xoá khỏi Elasticsearch
    await client.delete({
      index: 'pdf_documents1',
      id,
    });

    // Xoá file gốc
    const filePath = path.join(__dirname, '../documents', id);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: 'Xoá tài liệu thành công' });
  } catch (error) {
    console.error('Lỗi xoá tài liệu:', error);
    res.status(500).json({ message: 'Xoá thất bại', error: error.message });
  }
}

module.exports = { getDocument , getAllDocuments, deleteDocument};