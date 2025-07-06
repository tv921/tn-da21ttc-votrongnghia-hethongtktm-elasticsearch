const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser, updateUser} = require('../controllers/user.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');


// Chỉ admin có quyền
router.get('/admin/users', verifyToken, requireRole('admin'), getAllUsers);
router.delete('/admin/users/:id', verifyToken, requireRole('admin'), deleteUser);
router.put('/admin/users/:id', verifyToken, requireRole('admin'), updateUser);

module.exports = router;
