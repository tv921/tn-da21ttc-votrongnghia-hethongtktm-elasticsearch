const multer = require('multer');
const path = require('path');
const express = require('express');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const router = express.Router();

// Cấu hình lưu file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../documents')),
  filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

// Gửi 1 file PDF sang FastAPI
const sendToFastAPI = async (filePath) => {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));

  const headers = form.getHeaders();

  try {
    const response = await axios.post('http://localhost:8000/process-pdf', form, { headers });
    return { file: path.basename(filePath), result: response.data };
  } catch (err) {
    console.error(`❌ Lỗi xử lý ${filePath}:`, err.message);
    return { file: path.basename(filePath), error: err.message };
  }
};

// API upload nhiều file
const uploadDocument = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'Không có file nào được tải lên.' });
  }

  try {
    const results = [];

    for (const file of req.files) {
      const filePath = path.join(__dirname, '../documents', file.filename);
      const result = await sendToFastAPI(filePath);
      results.push(result);
    }

    res.json({ message: 'Xử lý tài liệu hoàn tất', results });
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi khi xử lý tài liệu',
      error: error.message
    });
  }
};

// Đảm bảo key upload là 'pdfs'
router.post('/upload', upload.array('pdfs', 10), uploadDocument);

module.exports = router;
