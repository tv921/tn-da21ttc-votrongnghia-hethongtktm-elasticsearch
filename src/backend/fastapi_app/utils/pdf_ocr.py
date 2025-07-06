
import os
import re
import time
from datetime import datetime
from dotenv import load_dotenv

import torch
from elasticsearch import Elasticsearch
from sentence_transformers import SentenceTransformer
from pdf2image import convert_from_path
import pytesseract

# Cấu hình Tesseract & Poppler
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
POPPLER_PATH = r"C:\Program Files\poppler-24.08.0\Library\bin"

# Load biến môi trường
load_dotenv()
ELASTIC_URL = os.getenv("ELASTICSEARCH_URL", "http://localhost:9200")
ELASTIC_USER = os.getenv("ELASTICSEARCH_USERNAME")
ELASTIC_PASS = os.getenv("ELASTICSEARCH_PASSWORD")
INDEX_NAME = "pdf_documents2"

# Elasticsearch client
if ELASTIC_USER and ELASTIC_PASS:
    es = Elasticsearch(
        hosts=[ELASTIC_URL],
        basic_auth=(ELASTIC_USER, ELASTIC_PASS),
        request_timeout=30
    )
else:
    es = Elasticsearch(ELASTIC_URL)

# Mô hình SentenceTransformer để tạo vector
device = "cuda" if torch.cuda.is_available() else "cpu"
model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2', device=device)

# -------------------------------------------
# Trích xuất văn bản bằng OCR (Tesseract)
# -------------------------------------------
def extract_text_from_pdf_ocr(pdf_path):
    text = ""
    try:
        images = convert_from_path(
            pdf_path,
            dpi=200,
            poppler_path=POPPLER_PATH,
            thread_count=4,
            grayscale=True
        )
        for img in images:
            text += pytesseract.image_to_string(
                img,
                lang='vie',
                config='--oem 1'
            ) + "\n"
    except Exception as e:
        print(f"[OCR ERROR] {e}")
    return text.strip()

# Sửa lỗi nhận dạng ký tự thường gặp từ OCR
def clean_ocr_text(text):
    corrections = {'l': '1', 'I': '1', 'O': '0', 'o': '0', 'Z': '2'}
    return ''.join(corrections.get(c, c) for c in text)

# Trích xuất ngày ban hành từ văn bản
def extract_promulgation_date(text):
    text = clean_ocr_text(text)
    date_patterns = [
        r"ngày\s+(\d{1,2})\s+tháng\s+(\d{1,2})\s+năm\s+(\d{4})",
        r"tháng\s+(\d{1,2})\s+năm\s+(\d{4})",
        r"(\d{1,2})[/-](\d{1,2})[/-](\d{4})",
        r"(\d{4}-\d{2}-\d{2})T"
    ]
    for pattern in date_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            try:
                groups = list(map(int, match.groups()))
                if len(groups) == 3:
                    return datetime(groups[2], groups[1], groups[0]).strftime("%Y-%m-%d")
                elif len(groups) == 2:
                    return datetime(groups[1], groups[0], 1).strftime("%Y-%m-%d")
                elif len(groups) == 1:
                    return match.group(1)
            except:
                continue
    return None

# Trích xuất loại văn bản (Công văn, Quyết định, ...)
def extract_loai_van_ban(text):
    loai_patterns = [
        r"(Công văn)\s+số",
        r"(Thông tư)\s+số",
        r"(Quyết định)\s+số",
        r"(Nghị định)\s+số",
        r"(Chỉ thị)\s+số",
        r"(Báo cáo)\s+số",
        r"(Tờ trình)\s+số",
        r"(Giấy mời)\s+số"
    ]
    for pattern in loai_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1)
    return "Không rõ"

# Tạo index trên Elasticsearch nếu chưa có
def create_index():
    if es.indices.exists(index=INDEX_NAME):
        return
    mapping = {
        "mappings": {
            "properties": {
                "title": {"type": "keyword"},
                "file_path": {"type": "keyword"},
                "content": {"type": "text"},
                "ngay_ban_hanh": {"type": "date"},
                "loai_van_ban": {"type": "keyword"},
                "vector": {
                    "type": "dense_vector",
                    "dims": 384,
                    "index": True,
                    "similarity": "cosine"
                }
            }
        }
    }
    es.indices.create(index=INDEX_NAME, body=mapping)

# Xử lý một file PDF: OCR -> Vector hóa -> Gửi vào Elasticsearch
def process_pdf_for_indexing(pdf_path):
    create_index()
    doc_id = os.path.basename(pdf_path)

    if es.exists(index=INDEX_NAME, id=doc_id):
        print(f"❌ Đã tồn tại: {doc_id}")
        return {"status": "exists", "id": doc_id}

    print(f"🔄 Đang xử lý: {doc_id}")
    start_time = time.time()

    text = extract_text_from_pdf_ocr(pdf_path)
    if not text:
        return {"status": "error", "message": "Không thể trích xuất nội dung"}

    loai_van_ban = extract_loai_van_ban(text)
    ngay_ban_hanh = extract_promulgation_date(text)
    vector = model.encode(text, convert_to_numpy=True, normalize_embeddings=True).tolist()

    doc = {
        "_index": INDEX_NAME,
        "_id": doc_id,
        "_source": {
            "title": os.path.basename(pdf_path),
            "file_path": pdf_path,
            "content": text,
            "ngay_ban_hanh": ngay_ban_hanh,
            "loai_van_ban": loai_van_ban,
            "vector": vector
        }
    }

    es.index(index=INDEX_NAME, id=doc_id, document=doc["_source"])
    total_time = time.time() - start_time
    return {
        "status": "success",
        "id": doc_id,
        "title": doc["_source"]["title"],
        "ngay_ban_hanh": ngay_ban_hanh,
        "loai_van_ban": loai_van_ban,
        "time": f"{total_time:.2f}s"
    }
