# VRM Fighter

VRMモデルを使用したストリートファイター風の対戦アプリケーション。

## 機能

- VRMファイルのアップロード
- 2体のVRMキャラクターの選択と対戦
- HPバーと対戦結果の表示
- ダークモード対応のUI

## 開発環境のセットアップ

### 必要なツール

- Docker
- Docker Compose

### プロジェクトの起動

1. **Docker Composeを使用して全てのサービスを起動**

    ```bash
    docker-compose up --build
    ```

2. **ブラウザでアプリケーションにアクセス**

    - フロントエンド: [http://localhost:3000](http://localhost:3000)
    - バックエンド: [http://localhost:8000](http://localhost:8000)

## バックエンド（FastAPI）

### エンドポイント

- `POST /upload-vrm/`: VRMファイルのアップロード
- `GET /uploads/{filename}`: アップロードされたVRMファイルの取得

## フロントエンド

### ファイル

- `index.html`: アプリケーションのメインページ
- `style.css`: ダークモードのスタイルシート
- `main.js`: Three.jsとthree-vrmを使用したVRMの表示と対戦ロジック

## 使用技術

- **バックエンド**: FastAPI, Python
- **フロントエンド**: Three.js, three-vrm, HTML, CSS, JavaScript
- **インフラ**: Docker, Docker Compose

## ライセンス

VRM Fighter License

このソフトウェアは、個人、教育、非商用目的での使用が許可されています。商用利用を希望する場合は、著作権者に連絡して別途商用ライセンスを取得してください。

詳細については、[LICENSE](./LICENSE) ファイルを参照してください。
