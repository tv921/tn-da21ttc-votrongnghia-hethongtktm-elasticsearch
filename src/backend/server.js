const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const searchRoutes = require('./routes/search.routes');
const documentRoutes = require('./routes/document.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const searchHistoryRoutes = require('./routes/searchHistory.routes');

const app = express();

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/document-db', {
}).then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Cấu hình CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://192.168.1.8:5173', 'http://localhost:3000'], // Cho phép cả localhost và IP LAN
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Đường dẫn file tĩnh
app.use('/documents', express.static(path.join(__dirname, 'documents')));

// Tuyến API
app.use('/api', searchRoutes);
app.use('/api', documentRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api', userRoutes);
app.use('/api', searchHistoryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
