import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import ResultList from '../components/ResultList';
import Navbar from '../components/Navbar';
import { FaBookOpen, FaExclamationCircle } from 'react-icons/fa'; // Thêm icon

const SearchPage = () => {
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [field, setField] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [loading, setLoading] = useState(false);
  const pageSize = 8;
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null); // Thêm state để quản lý lỗi

  // Xử lý tìm kiếm khi người dùng nhấn nút
  const handleSearch = ({ query, field, fromDate, toDate, documentType }) => {
    setQuery(query);
    setField(field);
    setFromDate(fromDate);
    setToDate(toDate);
    setDocumentType(documentType);
    setPage(1); // Luôn reset về trang 1 khi tìm kiếm mới
    setHasSearched(true);
    setError(null); // Reset lỗi
    fetchResults(query, 1, field, fromDate, toDate, documentType);
  };

  // Hàm fetch dữ liệu từ backend
  const fetchResults = async (q, p, f = field, from = fromDate, to = toDate, docType = documentType) => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const token = localStorage.getItem('token');

      const params = new URLSearchParams();
      params.append('query', q || '');
      params.append('page', p);
      params.append('size', pageSize);
      params.append('field', f || 'all');

      if (from) params.append('fromDate', from);
      if (to) params.append('toDate', to);
      if (docType) params.append('documentType', docType);

      const res = await fetch(`http://localhost:5000/api/search?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText || 'Unknown error'}`);
      }

      const data = await res.json();
      setResults(data.results || []); // Đảm bảo luôn là một mảng
      setTotal(data.total || 0); // Đảm bảo luôn là số
    } catch (err) {
      console.error('Lỗi khi tìm kiếm:', err);
      setResults([]);
      setTotal(0);
      setError('Đã xảy ra lỗi khi tìm kiếm tài liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Khi người dùng chuyển trang
  useEffect(() => {
    if (hasSearched) { // Chỉ gọi API khi đã có lần tìm kiếm ban đầu
      fetchResults(query, page, field, fromDate, toDate, documentType);
    }
  }, [page]); // Chỉ chạy khi 'page' thay đổi

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tiêu đề trang */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-blue-800 tracking-tight mb-4 animate-fadeIn">
            Hệ thống tìm kiếm tài liệu
          </h1>
          
        </div>

        {/* Search Bar */}
        <div className="mb-10 animate-slideInUp">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Thông báo kết quả / trạng thái */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6 animate-fadeIn" role="alert">
            <strong className="font-bold">Lỗi: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {loading && (
          <div className="text-center text-blue-600 mt-10 text-lg flex items-center justify-center animate-pulse">
            <FaBookOpen className="mr-3 text-2xl" /> Đang tải kết quả...
          </div>
        )}

        {!loading && hasSearched && total > 0 && (
          <p className="text-center text-gray-700 mb-6 text-lg font-medium animate-fadeIn">
            Tìm thấy <span className="font-bold text-blue-700">{total}</span> tài liệu phù hợp.
          </p>
        )}

        {/* Hiển thị danh sách kết quả hoặc thông báo không có kết quả */}
        {!loading && hasSearched && results.length === 0 && !error && (
          <div className="text-center mt-10 p-8 bg-white rounded-lg shadow-md animate-fadeIn">
            <FaExclamationCircle className="text-yellow-500 text-5xl mb-4 mx-auto" />
            <p className="text-xl text-gray-700 font-semibold mb-2">Không tìm thấy tài liệu nào.</p>
            <p className="text-gray-500">Hãy thử thay đổi từ khóa hoặc bộ lọc tìm kiếm của bạn.</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <ResultList results={results} />
        )}

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-10 space-x-3 animate-fadeIn">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-5 py-3 rounded-lg text-lg font-semibold transition-all duration-300
                  ${page === i + 1
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-gray-200 text-gray-700 hover:bg-blue-100 hover:text-blue-700'
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-blue-800 text-white py-6 shadow-inner mt-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:justify-between items-center text-sm">
          <nav className="mb-4 sm:mb-0">
            <ul className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-8">
              <li><a href="/site/about" className="text-white hover:text-blue-200 transition">Về chúng tôi</a></li>
              <li><a href="/site/help" className="text-white hover:text-blue-200 transition">Hỗ trợ</a></li>
              <li><a href="/site/contact" className="text-white hover:text-blue-200 transition">Phản hồi</a></li>
              <li><a href="/site/terms" className="text-white hover:text-blue-200 transition">Điều khoản sử dụng</a></li>
            </ul>
          </nav>
          <div className="text-center sm:text-right">
            © {new Date().getFullYear()} Hệ thống tra cứu tài liệu thông minh.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SearchPage;