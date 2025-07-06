import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const FormCardLayout = ({ title, children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-blue-200 relative px-4">
      {/* Nút quay về */}
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-blue-700 hover:text-blue-900 transition duration-200"
      >
        <FaArrowLeft />
        <span>Trang chủ</span>
      </Link>

      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        {title && (
          <h2 className="text-2xl font-bold text-center text-blue-700 mb-4">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
};

export default FormCardLayout;
