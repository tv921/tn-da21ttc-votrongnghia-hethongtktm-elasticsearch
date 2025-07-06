const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret';

const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      req.user = decoded;
    } catch (err) {
      // Token không hợp lệ, bỏ qua và không gán req.user
    }
  }
  next();
};

module.exports = optionalAuth;