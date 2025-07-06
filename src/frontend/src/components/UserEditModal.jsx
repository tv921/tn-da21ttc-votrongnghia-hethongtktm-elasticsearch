// components/UserEditModal.jsx
import React, { useState, useEffect } from 'react';

const UserEditModal = ({ user, onClose, onSave }) => {
  const [form, setForm] = useState({});

  useEffect(() => {
    if (user) setForm(user);
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold text-center">Chỉnh sửa người dùng</h2>

        <input className="w-full border p-2 rounded" name="name" placeholder="Họ tên" value={form.name || ''} onChange={handleChange} />

        <input className="w-full border p-2 rounded" name="email" placeholder="Email" value={form.email || ''} onChange={handleChange} />

        <select className="w-full border p-2 rounded" name="role" value={form.role} onChange={handleChange}>
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>

        <label className="flex items-center space-x-2">
          <input type="checkbox" name="verified" checked={form.verified || false} onChange={handleChange} />
          <span>Đã xác minh</span>
        </label>

        <label className="flex items-center space-x-2">
          <input type="checkbox" name="isActive" checked={form.isActive || false} onChange={handleChange} />
          <span>Hoạt động</span>
        </label>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Huỷ</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Lưu</button>
        </div>
      </form>
    </div>
  );
};

export default UserEditModal;
