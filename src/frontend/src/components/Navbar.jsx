import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBookOpen, FaUser, FaUpload, FaSignOutAlt, FaHistory, FaCaretDown, FaCog } from 'react-icons/fa';

const Navbar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');
  const name = localStorage.getItem('name');

  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const toggleAdminMenu = () => {
    setIsAdminMenuOpen(!isAdminMenuOpen);
  };

  return (
    <nav className="bg-blue-700 text-white py-4 shadow-md">
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo và tên ứng dụng */}
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
          <FaBookOpen className="text-white" />
          <span>Tra cứu tài liệu</span>
        </Link>

        {/* Các liên kết điều hướng và thông tin người dùng */}
        <div className="flex items-center gap-5 text-sm">
          {/* Menu Admin (chỉ hiển thị nếu là admin) */}
          {role === 'admin' && (
            <div className="relative">
              <button
                onClick={toggleAdminMenu}
                className="hover:text-blue-200 flex items-center gap-1 focus:outline-none"
              >
                <FaCog /> Quản lý <FaCaretDown className={`transform transition-transform ${isAdminMenuOpen ? 'rotate-180' : 'rotate-0'}`} />
              </button>
              {isAdminMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-blue-700 rounded-md shadow-lg py-1 z-10">
                  <Link
                    to="/upload"
                    className="block px-4 py-2 hover:bg-blue-100 flex items-center gap-2"
                    onClick={() => setIsAdminMenuOpen(false)}
                  >
                    <FaUpload /> Thêm tài liệu
                  </Link>
                  <Link
                    to="/admin/documents"
                    className="block px-4 py-2 hover:bg-blue-100 flex items-center gap-2"
                    onClick={() => setIsAdminMenuOpen(false)}
                  >
                    <FaBookOpen /> Quản lý tài liệu
                  </Link>
                  <Link
                    to="/admin/users"
                    className="block px-4 py-2 hover:bg-blue-100 flex items-center gap-2"
                    onClick={() => setIsAdminMenuOpen(false)}
                  >
                    <FaUser /> Quản lý tài khoản
                  </Link>
                  <Link
                    to="/admin/search-history"
                    className="block px-4 py-2 hover:bg-blue-100 flex items-center gap-2"
                    onClick={() => setIsAdminMenuOpen(false)}
                  >
                    <FaHistory /> Lịch sử tìm kiếm
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Hiển thị khi đã đăng nhập */}
          {token ? (
            <div className="flex items-center gap-4">
              {/* Thêm Link để chuyển hướng đến trang chỉnh sửa thông tin cá nhân */}
              <Link to="/profile" className="flex items-center gap-2 font-medium hover:text-blue-200 cursor-pointer">
                <FaUser /> {name || 'Người dùng'}
              </Link>
              <button onClick={handleLogout} className="hover:text-red-200 flex items-center gap-1">
                <FaSignOutAlt /> Đăng xuất
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-200">Đăng nhập</Link>
              <Link to="/register" className="hover:text-blue-200">Đăng ký</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;