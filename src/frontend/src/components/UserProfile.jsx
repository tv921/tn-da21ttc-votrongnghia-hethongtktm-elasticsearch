
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FormCardLayout from '../components/FormCardLayout';

const UserProfile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    avatarUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserData(response.data);
      } catch (err) {
        console.error('Lỗi khi tải thông tin người dùng:', err);
        setError('Không thể tải thông tin người dùng. Vui lòng thử lại.');
        toast.error('Không thể tải thông tin người dùng.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const dataToUpdate = {
      name: userData.name,
      avatarUrl: userData.avatarUrl,
    };

    const response = await axios.put(`http://localhost:5000/api/users/profile`, dataToUpdate, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    toast.success('Cập nhật thông tin thành công!');
  
    // Cập nhật lại tên trong localStorage nếu tên được sửa
    if (response.data.user.name) {
      localStorage.setItem('name', response.data.user.name);
    }

    // Chờ 2 giây rồi chuyển về trang chủ
    setTimeout(() => {
      navigate('/');
    }, 2000);

  } catch (err) {
    console.error('Lỗi khi cập nhật thông tin:', err);
    setError('Cập nhật thông tin thất bại. Vui lòng thử lại.');
    toast.error('Cập nhật thông tin thất bại.');
  } finally {
    setLoading(false);
  }
};


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Đang tải thông tin...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-xl">{error}</p>
      </div>
    );
  }

  return (
    <FormCardLayout title="Thông tin cá nhân">
      <form onSubmit={handleSubmit} className="space-y-4 mt-8">
        <div>
          <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Tên người dùng:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={userData.name}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={userData.email}
            readOnly
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight bg-gray-100 cursor-not-allowed"
          />
          <p className="text-sm text-gray-500 mt-1"></p>
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          disabled={loading}
        >
          {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </form>
    </FormCardLayout>
  );
};

export default UserProfile;