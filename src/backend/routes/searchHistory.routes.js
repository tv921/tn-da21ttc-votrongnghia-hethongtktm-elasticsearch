const express = require('express');
const router = express.Router();
const { getSearchHistory } = require('../controllers/searchHistory.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

router.get('/admin/search-history', verifyToken, requireRole('admin'), getSearchHistory);

module.exports = router;
