import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import Navbar from '../components/Navbar';
import UserEditModal from '../components/UserEditModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminUserPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchRole, setSearchRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Cải tiến: fetchUsers có thể nhận tham số để lọc, giúp việc đặt lại bộ lọc dễ dàng hơn
  const fetchUsers = async (page = 1, email = searchEmail, role = searchRole) => {
  const token = localStorage.getItem('token');
  setLoading(true); 
  try {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', 7); // number off user per page
    if (email) params.append('email', email);
    if (role) params.append('role', role);

    const res = await axios.get(`http://localhost:5000/api/admin/users?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
   
    setUsers(res.data.users);
    setTotalPages(res.data.totalPages);
    setCurrentPage(res.data.currentPage);
  } catch (err) {
    toast.error('❌ Lỗi khi tải danh sách người dùng.');
    console.error('Lỗi khi tải danh sách người dùng:', err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchUsers(1, '', ''); // Tải trang đầu tiên khi component được mount
  }, []);

 const handleDelete = async (id) => {
  if (!window.confirm('Bạn có chắc chắn muốn xoá người dùng này?')) return;
  const token = localStorage.getItem('token');

  try {
    await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    toast.success('✅ Xoá người dùng thành công');
    // Tải lại dữ liệu trang hiện tại.
    // Nếu đây là người dùng cuối cùng trên trang này (và không phải trang 1), hãy lùi về trang trước.
    if (users.length === 1 && currentPage > 1) {
      fetchUsers(currentPage - 1);
    } else {
      fetchUsers(currentPage);
    }
  } catch (err) {
    toast.error('❌ Không thể xoá người dùng');
    console.error('Lỗi khi xoá người dùng:', err);
  }
};

  const handleUpdate = async (updatedData) => {
  const token = localStorage.getItem('token');
  try {
    const res = await axios.put(`http://localhost:5000/api/admin/users/${updatedData._id}`, updatedData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // Cập nhật danh sách
    setUsers(users.map(u => u._id === updatedData._id ? res.data.user : u));
    setEditingUser(null);
    toast.success('✅ Cập nhật người dùng thành công!');
  } catch (err) {
    toast.error('❌ Cập nhật thất bại');
    console.error('Lỗi khi cập nhật người dùng:', err);
  }
};

  // Cải tiến: Gọi fetchUsers với tham số rỗng để đảm bảo tải lại toàn bộ danh sách
  const handleReset = () => {
  setSearchEmail('');
  setSearchRole('');
  fetchUsers(1, '', ''); // Tải lại trang đầu tiên với bộ lọc trống
};

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages)
      fetchUsers(newPage, searchEmail, searchRole);
};

  const handleExportExcel = async () => {
    if (users.length === 0) {
      toast.warn('⚠️ Không có dữ liệu để xuất file Excel.');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Danh sách người dùng');

    // Thiết lập các cột và tiêu đề
    worksheet.columns = [
      { header: 'STT', key: 'stt', width: 5, style: { alignment: { horizontal: 'center' } } },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Vai trò', key: 'role', width: 15 },
      { header: 'Trạng thái', key: 'verified', width: 20 },
      { header: 'Ngày tạo', key: 'createdAt', width: 25, style: { numFmt: 'dd/mm/yyyy hh:mm:ss' } },
    ];

    // Thêm style cho hàng tiêu đề
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Thêm dữ liệu người dùng vào các hàng
    users.forEach((user, index) => {
      worksheet.addRow({
        stt: index + 1,
        email: user.email,
        role: user.role,
        verified: user.verified ? 'Đã xác minh' : 'Chưa xác minh',
        createdAt: user.createdAt ? new Date(user.createdAt) : 'N/A',
      });
    });

    // Tạo buffer và tải file
    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `danh_sach_nguoi_dung_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success('✅ Xuất file Excel thành công!');
    } catch (error) {
      console.error('Lỗi khi xuất file Excel:', error);
      toast.error('❌ Đã có lỗi xảy ra khi xuất file.');
    }
  };

  return (
   <>
  <Navbar />
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-6 text-gray-800">👥 Quản lý tài khoản người dùng</h1>

    {/* Bộ lọc */}
    <div className="bg-white p-6 rounded-lg shadow mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <input
          type="text"
          placeholder="🔍 Tìm theo email"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          className="border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={searchRole}
          onChange={(e) => setSearchRole(e.target.value)}
          className="border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả vai trò</option>
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
        <button
          onClick={() => fetchUsers(1)} // Luôn bắt đầu tìm kiếm từ trang 1
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          Lọc
        </button>
        <button
          onClick={handleReset}
          className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition"
        >
          🔄 Đặt lại
        </button>
        <button
          onClick={handleExportExcel}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition col-span-1 sm:col-span-3 lg:col-span-1"
        >
          📄 Xuất Excel
        </button>
      </div>
    </div>

    {/* Danh sách người dùng */}
    {loading ? (
      <p className="text-center text-gray-500 italic">⏳ Đang tải danh sách người dùng...</p>
    ) : users.length === 0 ? (
      <p className="text-center text-red-500 font-semibold">⚠️ Không tìm thấy người dùng nào.</p>
    ) : (
      <div className="space-y-4">
        {users.map((user) => (
          <div
            key={user._id}
            className="bg-white border border-gray-200 p-6 rounded-lg shadow hover:shadow-md transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Vai trò:</strong> {user.role}</p>
                <p><strong>Đã xác minh:</strong> {user.verified ? '✔️' : '❌'}</p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handleDelete(user._id)}
                  className="bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200 transition"
                >
                   Xoá
                </button>
                <button
                  onClick={() => setEditingUser(user)}
                  className="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200 transition"
                >
                  ✏️ Chỉnh sửa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Phân trang */}
    {totalPages > 1 && (
      <div className="flex justify-center items-center mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 mx-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Trang trước
        </button>
        <span className="px-4 py-2 font-semibold">
          Trang {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 mx-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Trang sau
        </button>
      </div>
    )}

    {/* Modal chỉnh sửa */}
    {editingUser && (
      <UserEditModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleUpdate}
      />
    )}

    <ToastContainer position="top-right" autoClose={3000} />
  </div>
</>
  );
};




export default AdminUserPage;
