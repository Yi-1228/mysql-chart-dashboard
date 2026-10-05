# 銷售資料分析 Dashboard - Python Flask 後端 API

本後端 API 專門為前端 Dashboard 提供 `GET /api/sales` 端點，負責安全地與 MySQL 資料庫通訊並回傳統一格式的 JSON 資料。

---

## 1. 系統架構與安全性

- **前後端分離**：前端僅透過 HTTP GET 呼叫 API，所有 MySQL 帳號密碼皆由伺服器端環境變數保護。
- **防止 SQL 注入**：`source` 參數使用白名單嚴格限制，僅允許 `sales_original_300` 與 `sales_updated_300`。
- **跨來源共用 (CORS)**：已啟用 `flask-cors`，允許部署在 GitHub Pages 的前端跨網域發送請求。

---

## 2. 快速啟動步驟

### 步驟 1：建立並啟用 Python 虛擬環境（建議）
```bash
# 進入 server 目錄
cd server

# 建立虛擬環境
python3 -m venv venv

# 啟用虛擬環境
# macOS / Linux:
source venv/bin/activate
# Windows:
# venv\Scripts\activate
```

### 步驟 2：安裝相依套件
```bash
pip install -r requirements.txt
```

### 步驟 3：設定環境變數
在專案根目錄或 `server` 目錄下建立 `.env` 檔案（可參考 `.env.example`）：
```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=your_username
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=your_database_name
PORT=5000
```

### 步驟 4：啟動 Flask API 伺服器
```bash
python app.py
```
伺服器將在 `http://localhost:5000` 啟動。

---

## 3. API 測試與端點規格

### 測試 API 健康狀態
```bash
curl http://localhost:5000/
```

### 取得原始資料表 (sales_original_300)
```bash
curl http://localhost:5000/api/sales?source=sales_original_300
```

### 取得更新資料表 (sales_updated_300)
```bash
curl http://localhost:5000/api/sales?source=sales_updated_300
```

### 回傳 JSON 格式範例：
```json
{
  "source": "sales_original_300",
  "data": [
    {
      "id": 1,
      "product_name": "旗艦級 15吋筆記型電腦",
      "category": "電腦設備",
      "unit_price": 38900,
      "quantity": 2,
      "total_price": 77800,
      "sale_date": "2026-03-15",
      "region": "實體門市"
    }
  ]
}
```

---

## 4. 前端 Dashboard 串接

當 Flask API 運行在 `http://localhost:5000` 時：
1. 開啟前端網頁右上角點選 **「API 網址」**。
2. 將 `API_BASE_URL` 設定為 `http://localhost:5000`（或在 `src/services/salesApi.ts` 中設定 `export const API_BASE_URL = 'http://localhost:5000';`）。
3. 點擊 **「套用並重新呼叫」**，即可即時呈現 MySQL 資料庫內容！
