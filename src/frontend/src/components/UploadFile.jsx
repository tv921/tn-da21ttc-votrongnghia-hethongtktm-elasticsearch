import { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

function UploadFile() {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(''); // 'success' | 'error'
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const handleFileChange = (e) => {
    setFiles(e.target.files);
    setMessage('');
    setStatus('');
  };

const handleUpload = async () => {
  if (files.length === 0) {
    setMessage('Vui lòng chọn file');
    setStatus('error');
    return;
  }

  setLoading(true);
  setMessage('');
  setStatus('');
  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append('pdfs', file);
  });

  // Tạo tiến trình giả lập vì server không trả progress từng file
  const newProgress = {};
  Array.from(files).forEach(file => {
    newProgress[file.name] = 'Đang tải lên...';
  });
  setUploadProgress(newProgress);

  try {
    const res = await axios.post('http://localhost:5000/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const updatedProgress = {};
    Array.from(files).forEach(file => {
      updatedProgress[file.name] = '✔️ Thành công';
    });
    setUploadProgress(updatedProgress);

    setMessage(res.data.message || 'Tải lên thành công');
    setStatus('success');
  } catch (err) {
    const updatedProgress = {};
    Array.from(files).forEach(file => {
      updatedProgress[file.name] = '❌ Lỗi';
    });
    setUploadProgress(updatedProgress);

    setMessage('Upload lỗi: ' + (err.response?.data?.message || 'Không xác định'));
    setStatus('error');
  } finally {
    setLoading(false);
  }
};


  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md">

          {/* PHẦN MÔ TẢ MỚI THÊM */}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Tải lên tài liệu PDF</h2>
          <p className="text-sm text-gray-600">
            Bạn có thể chọn một hoặc nhiều tệp PDF để tải lên hệ thống. Sau khi được xử lý, nội dung tài liệu sẽ
            được phân tích và lưu trữ để phục vụ cho chức năng tìm kiếm thông minh.
          </p>
        </div>

          <input
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-md file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100 mb-4"
          />
          
          <button
          disabled={loading}
          onClick={handleUpload}
          className={`w-full py-2 px-4 rounded-md text-white font-semibold 
            ${loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
          {loading ? 'Đang tải lên...' : 'Tải lên'}
          </button>

          {Object.keys(uploadProgress).length > 0 && (
          <div className="mt-4">
          <h3 className="text-sm font-semibold mb-2">Trạng thái file:</h3>
          <ul className="text-sm text-gray-700">
          {Object.entries(uploadProgress).map(([fileName, status]) => (
          <li key={fileName} className="flex justify-between">
          <span>{fileName}</span>
          <span>{status}</span>
          </li>
          ))}
          </ul>
          </div>
          )}


          {message && (
            <p
              className={`mt-4 text-center text-sm p-2 rounded 
              ${status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
            >
              {message}
            </p>
          )}

        </div>
      </div>
    </>
  );
}

export default UploadFile;
