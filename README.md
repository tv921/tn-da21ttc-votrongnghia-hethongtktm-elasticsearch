
# Tên đề tài: Tìm hiểu công nghệ Elasticsearch và xây dựng hệ thống tìm kiếm tài liệu thông minh

## 📌 Giới thiệu

Hệ thống hỗ trợ tìm kiếm tài liệu PDF nhanh chóng và chính xác, bao gồm cả tìm kiếm từ khóa và tìm kiếm ngữ nghĩa, giúp người dùng dễ dàng truy xuất thông tin học thuật hoặc hành chính.

---

## 🎯 Mục tiêu

- **Tìm hiểu và ứng dụng Elasticsearch**: Phân tích kiến trúc, cơ chế hoạt động, và khả năng xử lý dữ liệu phi cấu trúc.
- **Xây dựng hệ thống tìm kiếm thông minh**:
  - Frontend: ReactJS
  - Backend: Node.js (Express)
  - Xử lý dữ liệu: Python + SentenceTransformers
  - Lưu trữ & tìm kiếm: Elasticsearch
- **Cải thiện trải nghiệm người dùng**: Giao diện trực quan, kết quả phản hồi nhanh, hỗ trợ xem và tải tài liệu PDF.


---

## 🏗️ Kiến trúc hệ thống

```
                [Frontend - ReactJS]
                         |
                         v
               [Backend - Node.js/Express]
                         |
            -----------------------------
            |                           |
            v                           v
   [Elasticsearch]             [Python Service]
 (Lưu trữ & tìm kiếm)     (Xử lý PDF, sinh vector)
```

Các thành phần chính:
- `frontend/`: Giao diện người dùng (React)
- `backend/`: API xác thực, quản lý (Node.js + Express)
- `fastapi_app/`: Python xử lý PDF, sinh embedding
- `Elasticsearch`: Lưu trữ tài liệu & tìm kiếm full-text/ngữ nghĩa

---

## 🧰 Phần mềm & công cụ cần thiết

**Yêu cầu cài đặt:**

- [Node.js](https://nodejs.org/)
- [Python 3.9+](https://www.python.org/)
- [Elasticsearch 8.x](https://www.elastic.co/downloads/elasticsearch)
- [MongoDB Compass](https://www.mongodb.com/products/compass)
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) (nếu xử lý PDF scan)

**Thư viện Python:**
```bash
pip install -r requirements.txt
```

Các thư viện quan trọng:
- `sentence-transformers`
- `elasticsearch`
- `python-dotenv`
- `pytesseract`
- `torch`

**Thư viện Node.js:**
```bash
npm install
```

---

## 🚀 Hướng dẫn chạy chương trình

### 1. Cài đặt Elasticsearch

- Cài và chạy Elasticsearch tại `http://localhost:9200`
- Tạo chỉ mục và mapping phù hợp (sử dụng script có sẵn nếu có)

### 2. Cấu hình file `.env`

Tạo file `.env` ở thư mục gốc và thêm:
```
PORT=3000
MONGO_URI=mongodb://localhost:27017/document_db
ELASTICSEARCH_NODE=http://localhost:9200
```

### 3. Chạy backend

```bash
cd backend
npm start
```

### 4. Chạy frontend

```bash
cd frontend
npm start
```

### 5. Chạy dịch vụ xử lý tài liệu bằng Python

```bash
cd fastapi_app
uvicorn main:app --reload
```

---

## 📂 Cấu trúc thư mục

```
project/
├── backend/
│   └── controllers/, routes/, server.js, ...
├── frontend/
│   └── src/, public/
├── fastapi_app/
│   └── main.py, document_processing.py, ...
├── .env
├── README.md
```

---

## 📌 Tác giả

**Sinh viên:** Võ Trọng Nghĩa  
**Giảng viên hướng dẫn:** ThS. Nguyễn Khắc Quốc  
**Trường:** Đại học Trà Vinh, Khoa Kỹ thuật & Công nghệ

---
