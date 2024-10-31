# backend/Dockerfile

# ベースイメージ
FROM python:3.11-slim

# システムパッケージのインストール
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

# 作業ディレクトリの作成
WORKDIR /app

# 必要なパッケージのインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 環境変数の設定
COPY .env .

# アプリケーションのコピー
COPY . .

# ポート8031を公開
EXPOSE 8031

# サーバーの起動
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]