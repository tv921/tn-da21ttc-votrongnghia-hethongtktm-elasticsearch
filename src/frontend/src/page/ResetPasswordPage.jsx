import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FormCardLayout from '../components/FormCardLayout';

const ResetPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);

  const handleSendOTP = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/request-reset', { email });
      toast.success('Đã gửi mã xác minh đến email của bạn.');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi gửi mã OTP');
    }
  };

  const handleResetPassword = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/reset-password', {
        email,
        otp,
        newPassword
      });
      toast.success('Đặt lại mật khẩu thành công. Hãy đăng nhập lại.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đặt lại mật khẩu thất bại');
    }
  };

  return (
    <FormCardLayout title="Đặt lại mật khẩu">
      {step === 1 && (
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleSendOTP}
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition duration-200"
          >
            Gửi mã xác minh
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Mã OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            placeholder="Mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleResetPassword}
            className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700 transition duration-200"
          >
            Xác nhận đặt lại mật khẩu
          </button>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </FormCardLayout>
  );
};

export default ResetPasswordPage;

