import React, { useState } from 'react';
import { FaSearch, FaChevronDown, FaFilter } from 'react-icons/fa';

const SearchBar = ({ onSearch }) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [query, setQuery] = useState('');
  const [field, setField] = useState('all');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [documentType, setDocumentType] = useState('');

  const handleSearch = () => {
    // Kiểm tra nếu tất cả các trường đều trống thì không làm gì cả
    if (!query && !fromDate && !toDate && !documentType && field === 'all') {
      alert('Vui lòng nhập từ khóa hoặc chọn bộ lọc để tìm kiếm.');
      return;
    }
    onSearch({ query, field, fromDate, toDate, documentType });
  };

  const toggleAdvancedOptions = () => {
    setIsAdvancedOpen(!isAdvancedOpen);
  };

  return (
    <div className="relative max-w-5xl mx-auto w-full p-4 bg-white rounded-2xl shadow-xl border border-gray-100">
      {/* Phần tìm kiếm chính */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        {/* Input tìm kiếm */}
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm tài liệu theo tên, nội dung..."
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        {/* Nút lọc (Advanced Options) */}
        <button
          onClick={toggleAdvancedOptions}
          className="flex items-center justify-center px-5 py-3 bg-gray-100 text-gray-700 rounded-lg shadow-sm text-sm hover:bg-gray-200 transition duration-200 transform hover:scale-105 active:scale-95 whitespace-nowrap w-full md:w-auto"
        >
          <FaFilter className="mr-2" />
          Bộ lọc
          <FaChevronDown className={`ml-2 transition-transform duration-200 ${isAdvancedOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Nút tìm kiếm chính */}
        <button
          onClick={handleSearch}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 shadow-md transform hover:scale-105 active:scale-95 whitespace-nowrap w-full md:w-auto"
        >
          <FaSearch className="inline-block mr-2" />
          Tìm kiếm
        </button>
      </div>

      {/* Phần tùy chọn nâng cao */}
      {isAdvancedOpen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-200 animate-fadeIn">
          {/* Lọc theo trường */}
          <div>
            <label htmlFor="searchField" className="block text-gray-600 text-sm font-medium mb-1">
              Tìm kiếm trong:
            </label>
            <select
              id="searchField"
              value={field}
              onChange={(e) => setField(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            >
              <option value="all">Tất cả các trường</option>
              <option value="title">Tiêu đề tài liệu</option>
              <option value="content">Nội dung tài liệu</option>
            </select>
          </div>

          {/* Lọc theo ngày ban hành */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-gray-600 text-sm font-medium mb-1">
              Ngày ban hành:
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                placeholder="Từ ngày"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                placeholder="Đến ngày"
              />
            </div>
          </div>

          {/* Lọc theo loại văn bản */}
          {/*
          <div>
            <label htmlFor="documentType" className="block text-gray-600 text-sm font-medium mb-1">
              Loại văn bản:
            </label>
            <select
              id="documentType"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            >
              <option value="">Tất cả loại văn bản</option>
              <option value="Công văn">Công văn</option>
              <option value="Thông tư">Thông tư</option>
              <option value="Quyết định">Quyết định</option>
              <option value="Nghị định">Nghị định</option>
              <option value="Chỉ thị">Chỉ thị</option>
              <option value="Tờ trình">Tờ trình</option>
              <option value="Báo cáo">Báo cáo</option>
              <option value="Giấy mời">Giấy mời</option>
            </select>
          </div>
          */}
        </div>
      )}
    </div>
  );
};

export default SearchBar;