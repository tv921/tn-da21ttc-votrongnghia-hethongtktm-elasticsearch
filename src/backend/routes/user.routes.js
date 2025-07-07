const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser, updateUser, getUserProfile, updateUserProfile} = require('../controllers/user.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');


// Chỉ admin có quyền
router.get('/admin/users', verifyToken, requireRole('admin'), getAllUsers);
router.delete('/admin/users/:id', verifyToken, requireRole('admin'), deleteUser);
router.put('/admin/users/:id', verifyToken, requireRole('admin'), updateUser);

//user
router.get('/users/profile', verifyToken, getUserProfile);
router.put('/users/profile', verifyToken, updateUserProfile);
console.log('User routes loaded');
module.exports = router;
