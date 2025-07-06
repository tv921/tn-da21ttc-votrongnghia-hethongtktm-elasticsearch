from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from utils.pdf_ocr import process_pdf_for_indexing
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/process-pdf")
async def process_pdf(file: UploadFile = File(...)):
    save_dir = os.path.join(os.path.dirname(__file__), "documents")
    os.makedirs(save_dir, exist_ok=True)
    file_path = os.path.join(save_dir, file.filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())
    result = process_pdf_for_indexing(file_path)
    return result
