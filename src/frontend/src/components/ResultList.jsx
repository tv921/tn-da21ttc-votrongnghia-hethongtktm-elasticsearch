import React from 'react';
import { Link } from 'react-router-dom';

const getFileName = (filePath) => {
  return filePath.split(/[/\\]/).pop(); // tách theo / hoặc \ lấy phần cuối
};

const ResultList = ({ results }) => {
  return (
    <div className="max-w-4xl mx-auto p-4">
      {results.length === 0 ? (
        <p className="text-center text-gray-500">Không tìm thấy tài liệu nào.</p>
      ) : (
        <div className="space-y-4">
          {results.map((result) => (
            <div
              key={result._id}
              className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {result._source.title || 'Không có tiêu đề'}
              </h2>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {result._source.content
                  ? result._source.content.slice(0, 150) + '...'
                  : 'Không có nội dung'}
              </p>
             
              <a
                href={`http://localhost:5000/documents/${getFileName(result._source.file_path)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Xem chi tiết
              </a>

            {/*
            <Link
              to={`/viewer/${getFileName(result._source.file_path)}`}
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              target="_blank"  // Mở trong tab mới
              rel="noopener noreferrer"  // Bảo mật chống tabnabbing
            >
              Xem nội dung
            </Link>
            */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultList;