import { useState } from 'react';
import axios from 'axios';

const VerifyOTPPage = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');

  const handleVerify = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        email,
        otp
      });
      setMessage(res.data.message || 'Xác minh thành công!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Lỗi xác minh');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-white p-6 shadow rounded w-full max-w-md space-y-4">
        <h2 className="text-lg font-bold text-center">Xác minh tài khoản</h2>
        <input
          type="email"
          placeholder="Email đã đăng ký"
          className="w-full p-3 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="Mã OTP"
          className="w-full p-3 border rounded"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <button
          onClick={handleVerify}
          className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
        >
          Xác minh
        </button>
        {message && <p className="text-center text-sm text-green-600">{message}</p>}
      </div>
    </div>
  );
};

export default VerifyOTPPage;
