import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';


const AdminSearchHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [emailFilter, setEmailFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/admin/search-history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error('Lỗi khi tải lịch sử tìm kiếm:', err);
      }
    };
    fetchHistory();
  }, []);

  const handleFilter = () => {
    let result = [...history];

    if (emailFilter) {
      result = result.filter(h => h.user?.email?.toLowerCase().includes(emailFilter.toLowerCase()));
    }

    if (fromDate) {
      const from = new Date(fromDate);
      result = result.filter(h => new Date(h.createdAt) >= from);
    }

    if (toDate) {
      const to = new Date(toDate);
      result = result.filter(h => new Date(h.createdAt) <= to);
    }

    setFiltered(result);
  };

  const exportToExcel = async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Lịch sử tìm kiếm');

  // Thêm tiêu đề cột
  worksheet.columns = [
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Từ khóa', key: 'query', width: 40 },
    { header: 'Trường tìm kiếm', key: 'field', width: 20 },
    { header: 'Thời gian', key: 'createdAt', width: 25 },
  ];

  // Ghi dữ liệu
  filtered.forEach(h => {
    worksheet.addRow({
      email: h.user?.email || 'Ẩn danh',
      query: h.query,
      field: h.field,
      createdAt: new Date(h.createdAt).toLocaleString('vi-VN'),
    });
  });

  // Tạo file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, 'lich_su_tim_kiem.xlsx');
};

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Lịch sử tìm kiếm người dùng</h1>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Lọc theo email"
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
            className="border px-3 py-2 rounded w-full sm:w-1/3"
          />
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border px-3 py-2 rounded"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border px-3 py-2 rounded"
          />
          <button
            onClick={handleFilter}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Lọc
          </button>

          <button
          onClick={exportToExcel}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
          Xuất Excel
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto border">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Từ khóa</th>
                <th className="px-4 py-2 border">Trường</th>
                <th className="px-4 py-2 border">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">Không có dữ liệu</td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item._id}>
                    <td className="px-4 py-2 border">{item.user?.email || 'Ẩn danh'}</td>
                    <td className="px-4 py-2 border">{item.query}</td>
                    <td className="px-4 py-2 border">{item.field}</td>
                    <td className="px-4 py-2 border">
                      {new Date(item.createdAt).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AdminSearchHistoryPage;
