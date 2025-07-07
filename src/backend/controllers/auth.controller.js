// auth.controller.js
const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret';

// --- Hàm tạo mã OTP 6 chữ số ---
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// --- Gửi email chứa mã OTP ---
async function sendOTPEmail(to, otp) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Hệ thống tài liệu" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Xác minh đăng ký - OTP',
    html: `<p>Mã xác minh của bạn là: <b>${otp}</b>. Mã có hiệu lực trong 5 phút.</p>`,
  });
}

// --- Đăng ký tài khoản ---
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email đã tồn tại' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const otp = generateOTP();
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();
    await sendOTPEmail(user.email, otp);

    res.status(201).json({ message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác minh.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ', error });
  }
};

// --- Đăng nhập ---
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).lean();
    if (!user) return res.status(401).json({ message: 'Email không tồn tại' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Sai mật khẩu' });

    if (!user.verified) {
      return res.status(403).json({ message: 'Tài khoản chưa được xác minh. Vui lòng kiểm tra email để nhập OTP.' });
    }

    const token = jwt.sign(
      { sub: user._id, role: user.role },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    res.json({
      accessToken: token,
      user: {
        id: user._id, 
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl || null, // Trả về avatarUrl nếu có
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ', error });
  }
};

// --- Xác minh mã OTP ---
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Không tìm thấy tài khoản.' });

    if (user.verified) return res.status(200).json({ message: 'Tài khoản đã xác minh.' });

    if (!user.otpCode || user.otpCode !== otp) {
      return res.status(400).json({ message: 'Mã OTP không chính xác.' });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Mã OTP đã hết hạn.' });
    }

    user.verified = true;
    user.otpCode = null;
    user.otpExpires = null;
    await user.save();

    res.json({ message: 'Xác minh thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ', error });
  }
};

exports.sendResetPasswordEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Email không tồn tại' });

    const resetCode = generateOTP();
    user.otpCode = resetCode;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendOTPEmail(email, resetCode);

    res.json({ message: 'Đã gửi mã đặt lại mật khẩu đến email.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Đặt lại mật khẩu
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Email không tồn tại' });

    if (user.otpCode !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Mã OTP không hợp lệ hoặc đã hết hạn' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otpCode = null;
    user.otpExpires = null;
    await user.save();

    res.json({ message: 'Đặt lại mật khẩu thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};