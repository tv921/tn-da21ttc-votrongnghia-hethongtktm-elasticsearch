import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!id) {
        setError('ID tài liệu không hợp lệ.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/api/document/${id}`);
        if (!response.data._source) {
          throw new Error('Không tìm thấy dữ liệu tài liệu.');
        }
        setDocument(response.data._source);
      } catch (err) {
        setError(`Không thể tải tài liệu: ${err.response?.data?.details || err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchDocument();
  }, [id]);

  if (loading) {
    return <div className="text-center p-4">Đang tải...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        {error}
        <button
          onClick={() => navigate('/search')}
          className="mt-4 inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
        >
          Quay lại tìm kiếm
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {document.title || 'Không có tiêu đề'}
        </h1>
        
        <div className="prose prose-sm max-w-none text-gray-700">
          {document.content? (
            <p>{document.content}</p>
          ) : (
            <p>Không có nội dung để hiển thị.</p>
          )}
        </div>
        <a
          href="/search"
          className="mt-6 inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
        >
          Quay lại tìm kiếm
        </a>
      </div>
    </div>
  );
};

export default ResultPage;