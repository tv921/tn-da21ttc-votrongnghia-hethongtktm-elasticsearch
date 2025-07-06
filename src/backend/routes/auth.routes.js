const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { register, login, verifyOTP, sendResetPasswordEmail, resetPassword} = require('../controllers/auth.controller'); 

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-otp', verifyOTP);
router.post('/request-reset', sendResetPasswordEmail);
router.post('/reset-password', resetPassword);

module.exports = router;
