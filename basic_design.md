# 基本要件定義書

## 概要
VRM同士が対戦するストリートファイター風のWebアプリケーションを開発します。

## 機能要件
- ユーザーがVRMファイルをアップロードできる。
- アップロードされたVRMから2体を選択し、対戦させる。
- 対戦アニメーションとHPバーの表示。
- ダークモードのUIデザイン。

## 非機能要件
- バックエンドはFastAPIを使用。
- フロントエンドはThree.jsとthree-vrmを使用。
- レスポンシブデザイン対応。
- Dockerを使用したコンテナ化。
- Docker Composeによるマルチコンテナ管理。

## 技術スタック
- **バックエンド**: FastAPI, Python
- **フロントエンド**: Three.js, three-vrm, HTML, CSS, JavaScript
- **インフラ**: Docker, Docker Compose
- **その他**: GitHub, Git

