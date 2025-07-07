
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
import dateparser
import cv2
import numpy as np

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

# Mô hình SentenceTransformer
device = "cuda" if torch.cuda.is_available() else "cpu"
model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2', device=device)

# -------------------------------------------
# OCR kết hợp xử lý ảnh
# -------------------------------------------
def preprocess_image(img):
    img_np = np.array(img)
    if len(img_np.shape) == 3 and img_np.shape[2] == 3:  # Nếu ảnh RGB (3 kênh)
        gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
    else:
        gray = img_np  # Đã grayscale rồi
    _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)
    return thresh


def extract_text_from_pdf_ocr(pdf_path):
    text = ""
    try:
        images = convert_from_path(
            pdf_path,
            dpi=300,
            poppler_path=POPPLER_PATH,
            thread_count=4,
            grayscale=True
        )
        for img in images:
            proc_img = preprocess_image(img)
            text += pytesseract.image_to_string(
                proc_img,
                lang='vie',
                config='--oem 1 --psm 6'
            ) + "\n"
    except Exception as e:
        print(f"[OCR ERROR] {e}")
    return text.strip()

def clean_ocr_text(text):
    corrections = {'l': '1', 'I': '1', 'O': '0', 'o': '0', 'Z': '2'}
    return ''.join(corrections.get(c, c) for c in text)

# -------------------------------------------
# Trích xuất ngày ban hành
# -------------------------------------------
def extract_promulgation_date(text):
    text = clean_ocr_text(text)
    date_patterns = [
        r"(ngày\s+\d{1,2}\s+tháng\s+\d{1,2}\s+năm\s+\d{4})",
        r"(\d{1,2})[./-](\d{1,2})[./-](\d{4})",
        r"(\d{4}-\d{2}-\d{2})T"
    ]
    for pattern in date_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            date_str = match if isinstance(match, str) else ' '.join(match)
            parsed = dateparser.parse(date_str, languages=['vi'])
            if parsed:
                return parsed.strftime("%Y-%m-%d")
    return None

# -------------------------------------------
# Trích xuất loại văn bản
# -------------------------------------------
def extract_loai_van_ban(text):
    types = ["Công văn", "Thông tư", "Quyết định", "Nghị định", "Chỉ thị", "Báo cáo", "Tờ trình", "Giấy mời"]
    lines = text.split("\n")
    
    for line in lines[:15]:  # Kiểm tra khoảng 15 dòng đầu
        clean_line = line.strip().lower()
        for t in types:
            if t.lower() in clean_line:
                return t
    return "Không rõ"


# -------------------------------------------
# Tạo index trên Elasticsearch nếu chưa có
# -------------------------------------------
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

# -------------------------------------------
# Xử lý một file PDF: OCR -> Vector hóa -> Gửi vào Elasticsearch
# -------------------------------------------
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

    if ngay_ban_hanh:
        try:
            datetime.strptime(ngay_ban_hanh, "%Y-%m-%d")
        except ValueError:
            ngay_ban_hanh = None

    # Vector hóa (có thể rút gọn chỉ lấy đoạn đầu nếu tài liệu quá dài)
    content_for_vector = text[:3000]  # 3000 ký tự đầu tiên
    vector = model.encode(content_for_vector, convert_to_numpy=True, normalize_embeddings=True).tolist()

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
