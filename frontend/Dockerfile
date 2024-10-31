# ベースイメージ
FROM nginx:alpine

# デフォルトのHTMLファイルを削除
RUN rm -rf /usr/share/nginx/html/*

# ビルドされたファイルをコピー
COPY dist /usr/share/nginx/html/dist
COPY index.html /usr/share/nginx/html/index.html
COPY style.css /usr/share/nginx/html/style.css
COPY assets /usr/share/nginx/html/assets

# nginx設定ファイルをコピー
COPY nginx.conf /etc/nginx/conf.d/default.conf