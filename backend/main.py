from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# .env ファイルの読み込み
load_dotenv()

app = FastAPI()
uploads_path = Path("uploads")
uploads_path.mkdir(exist_ok=True)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # フロントエンドのURLを指定
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# VRMファイルのアップロードエンドポイント
@app.post("/upload-vrm/")
async def upload_vrm(file: UploadFile = File(...)):
    file_path = uploads_path / file.filename
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
    return JSONResponse(content={"filename": file.filename})

# VRMファイルの取得エンドポイント
@app.get("/uploads/{filename}")
async def get_vrm(filename: str):
    file_path = uploads_path / filename
    if file_path.exists():
        return FileResponse(path=file_path, filename=filename)
    else:
        raise HTTPException(status_code=404, detail="File not found")

# テスト用のルートエンドポイント
@app.get("/")
async def root():
    return {"message": "VRM Fighter Backend"}