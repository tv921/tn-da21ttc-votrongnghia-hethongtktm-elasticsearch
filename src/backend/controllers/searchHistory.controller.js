const SearchHistory = require('../models/searchHistory.model');
const User = require('../models/user.model');

exports.getSearchHistory = async (req, res) => {
  try {
    const history = await SearchHistory.find()
      .sort({ createdAt: -1 })
      .populate('user', 'email role'); // lấy email và vai trò

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi lấy lịch sử tìm kiếm', error: err.message });
  }
};
