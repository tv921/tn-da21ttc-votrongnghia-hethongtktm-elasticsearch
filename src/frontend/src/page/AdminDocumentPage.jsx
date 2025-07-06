import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const getFileName = (filePath) => {
  return filePath?.split(/[/\\]/).pop();
};

const AdminDocumentPage = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);
  const pageSize = 6;

  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/documents', {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, size: pageSize }
      });
      setDocs(res.data.results || []);
      setTotalDocs(res.data.total || 0);
      setCurrentPage(res.data.page || 1);
    } catch (err) {
      console.error('Lỗi khi tải danh sách tài liệu:', err);
      toast.error("❌ Lỗi khi tải tài liệu.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Bạn có chắc chắn muốn xoá tài liệu này?");
    if (!confirm) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/document/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("✅ Đã xoá tài liệu thành công.");
      fetchDocuments(currentPage);
    } catch (error) {
      console.error("Lỗi xoá tài liệu:", error);
      toast.error("❌ Không thể xoá tài liệu.");
    }
  };

  const handleSearch = async ({ query, field, fromDate, toDate, documentType }) => {
    setSearching(true);
    setLoading(true);
    try {
      const params = {
        query: query || "",
        field,
        page: 1,
        size: pageSize,
      };
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      if (documentType) params.documentType = documentType;

      const res = await axios.get('http://localhost:5000/api/search', { params });
      setDocs(res.data.results || []);
      setTotalDocs(res.data.total || 0);
      setCurrentPage(1);
    } catch (error) {
      console.error('Lỗi tìm kiếm:', error);
      toast.error("❌ Lỗi khi tìm kiếm tài liệu.");
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  const totalPages = Math.ceil(totalDocs / pageSize);
  const goToPage = (page) => {
    if (searching) return; // tránh gọi API trong khi đang tìm kiếm
    fetchDocuments(page);
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Quản lý tài liệu</h1>
          <span className="text-sm text-gray-500">
            Tổng số: {totalDocs} tài liệu
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
          </div>
        ) : docs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">
              {searching ? 'Không tìm thấy tài liệu phù hợp' : 'Chưa có tài liệu nào'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {docs.map((doc) => (
                <div
                  key={doc._id}
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="font-semibold text-lg text-gray-800 line-clamp-1">
                      {doc._source.title || 'Không có tiêu đề'}
                    </h2>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {getFileName(doc._source.file_path)?.split('.').pop().toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {doc._source.content?.slice(0, 150) || 'Không có mô tả'}...
                  </p>
                  <div className="flex gap-3">
                    <a
                      href={`http://localhost:5000/documents/${getFileName(doc._source.file_path)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Xem
                    </a>
                    <button
                      onClick={() => handleDelete(doc._id)}
                      className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Xoá
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 space-x-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => goToPage(i + 1)}
                    className={`px-4 py-2 rounded-lg border ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border-blue-600'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="light"
        />
      </div>
    </>
  );
};

export default AdminDocumentPage;
