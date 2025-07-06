
const { searchDocuments } = require('../services/elasticsearch.service');
const SearchHistory = require('../models/searchHistory.model');


async function search(req, res) {
  try {
   const {
  query = '', // ✅ bảo đảm luôn là chuỗi, dù không nhập gì
  type = 'keyword',
  page = 1,
  size = 10,
  field = 'all',
  fromDate,
  toDate,
  documentType
} = req.query;

   const response = await searchDocuments(query, type, parseInt(page), parseInt(size), field, fromDate, toDate, documentType);
    console.log("Backend nhận params:", req.query);
    // ✅ Ghi lại lịch sử tìm kiếm nếu có user
    if (req.user && query && query.trim()) {
      await SearchHistory.create({
      user: req.user.sub,
      query,
      field
    });
  }


    res.json({
      total: response.hits.total?.value || 0,
      results: response.hits.hits
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { search };
