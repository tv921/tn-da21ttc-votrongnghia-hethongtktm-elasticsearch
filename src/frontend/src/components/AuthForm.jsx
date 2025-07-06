import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import FormCardLayout from './FormCardLayout';

const AuthForm = ({ isLogin }) => {
  const navigate = useNavigate();
  const [name, setName] = useState(''); // Thêm state cho tên người dùng
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // (Tùy chọn) Thêm validation cho tên người dùng
    if (!isLogin && !name.trim()) {
      setError('Vui lòng nhập tên của bạn');
      return;
    }

    if (!email.includes('@')) {
      setError('Email không hợp lệ');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      // Thêm 'name' vào payload khi đăng ký
      const payload = isLogin ? { email, password } : { name, email, password };
      
      const res = await axios.post(`http://localhost:5000${endpoint}`, payload);

      if (isLogin) {
        localStorage.setItem('token', res.data.accessToken);
        localStorage.setItem('role', res.data.user.role);
        localStorage.setItem('name', res.data.user.name);
        navigate(res.data.user.role === 'admin' ? '/search' : '/upload');
      } else {
        toast.success('Đăng ký thành công! Vui lòng kiểm tra email và nhập mã OTP để xác minh.');
        setShowOtpForm(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        email,
        otp
      });
      toast.success(res.data.message || 'Xác minh thành công!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xác minh thất bại');
    }
  };

  return (
    <FormCardLayout title={isLogin ? 'Đăng nhập vào hệ thống' : 'Tạo tài khoản mới'}>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      {success && <p className="text-green-600 text-sm mb-2">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Thêm ô nhập liệu cho tên, chỉ hiển thị khi không phải là form đăng nhập */}
        {!isLogin && (
          <input
            type="text"
            placeholder="Tên người dùng"
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Mật khẩu"
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {!isLogin && (
          <input
            type="password"
            placeholder="Xác nhận mật khẩu"
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        )}

        {isLogin && (
          <div className="text-right text-sm">
            <Link to="/reset-password" className="text-blue-600 hover:underline">
              Quên mật khẩu?
            </Link>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full p-3 rounded font-semibold text-white transition duration-200 ${
            loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Đang xử lý...' : isLogin ? 'Đăng nhập' : 'Đăng ký'}
        </button>
      </form>

      {showOtpForm && (
        <div className="mt-6 space-y-3">
          <input
            type="text"
            placeholder="Nhập mã OTP"
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button
            type="button"
            onClick={handleVerifyOTP}
            className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700 transition duration-200"
          >
            Xác minh OTP
          </button>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </FormCardLayout>
  );
};

export default AuthForm;