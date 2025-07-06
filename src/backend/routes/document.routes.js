const express = require('express');
const router = express.Router();
const { getDocument, getAllDocuments, deleteDocument } = require('../controllers/document.controller');
const  uploadDocument  = require('../controllers/uploadDocument.controller'); 
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

router.get('/document/:id', getDocument);
router.post('/upload', uploadDocument); // Đăng ký route upload
router.get('/admin/documents', verifyToken, requireRole('admin'), getAllDocuments);
router.delete('/document/:id', verifyToken, requireRole('admin'), deleteDocument);

module.exports = router;
