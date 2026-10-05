"""
獨立 Python Flask 後端 API 伺服器
提供 GET /api/sales 供前端 Dashboard 讀取 MySQL 銷售資料

【安全設計】：
- MySQL 連線資訊完全由環境變數讀取，不寫死於程式碼中。
- 資料來源嚴格限制為白名單：sales_original_300 與 sales_updated_300，防止 SQL Injection。
- 啟用 CORS，允許 GitHub Pages 或前端跨網域請求。
"""

import os
from datetime import date, datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv

# 載入 .env 環境變數 (若存在)
load_dotenv()

app = Flask(__name__)

# 啟用 CORS 跨來源資源共用，允許 GitHub Pages 前端發送跨域請求
CORS(app, resources={r"/api/*": {"origins": "*"}})

# 嚴格允許的資料表白名單 (防止 SQL Injection)
ALLOWED_SOURCES = {
    'sales_original_300': 'sales_original_300',
    'sales_updated_300': 'sales_updated_300',
}

def get_db_connection():
    """從環境變數讀取連線資訊建立 MySQL 連線"""
    host = os.getenv('MYSQL_HOST', 'localhost')
    port = int(os.getenv('MYSQL_PORT', 3306))
    user = os.getenv('MYSQL_USER')
    password = os.getenv('MYSQL_PASSWORD')
    database = os.getenv('MYSQL_DATABASE')

    if not user or not database:
        raise ValueError(
            "缺少 MySQL 必要環境變數！請設定 MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE。"
        )

    return mysql.connector.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        database=database,
        charset='utf8mb4',
        collation='utf8mb4_unicode_ci'
    )

@app.route('/', methods=['GET'])
def index():
    """API 根目錄健康檢查"""
    return jsonify({
        "status": "online",
        "service": "Sales Dashboard Flask API",
        "endpoints": {
            "get_sales_original": "/api/sales?source=sales_original_300",
            "get_sales_updated": "/api/sales?source=sales_updated_300"
        }
    })

@app.route('/api/sales', methods=['GET'])
def get_sales():
    """
    取得銷售資料端點
    支援 Query 參數：?source=sales_original_300 或 ?source=sales_updated_300
    預設值：sales_original_300
    """
    # 讀取 query 參數，預設為 sales_original_300
    source_param = request.args.get('source', 'sales_original_300').strip()

    # 7. 白名單檢驗：只允許 sales_original_300 或 sales_updated_300，其他一律拒絕
    if source_param not in ALLOWED_SOURCES:
        return jsonify({
            "error": "不合法的資料來源名稱 (Invalid source)",
            "message": "僅允許 'sales_original_300' 或 'sales_updated_300'，以防止 SQL Injection 安全疑慮。"
        }), 400

    table_name = ALLOWED_SOURCES[source_param]

    conn = None
    cursor = None
    try:
        # 連接 MySQL 資料庫
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # 10. 原始欄位對應查詢：
        # sale_id → id
        # product_name → product_name
        # category → category
        # unit_price → unit_price
        # quantity → quantity
        # unit_price * quantity → total_price
        # sale_date → sale_date
        # channel → region
        query = f"""
            SELECT 
                sale_id AS id,
                product_name,
                category,
                unit_price,
                quantity,
                (unit_price * quantity) AS total_price,
                sale_date,
                channel AS region
            FROM `{table_name}`
            ORDER BY sale_id ASC;
        """

        cursor.execute(query)
        rows = cursor.fetchall()

        # 格式化日期與數值以符合 JSON 規範
        formatted_data = []
        for row in rows:
            sale_date_val = row.get('sale_date')
            if isinstance(sale_date_val, (date, datetime)):
                formatted_date = sale_date_val.strftime('%Y-%m-%d')
            elif sale_date_val is not None:
                formatted_date = str(sale_date_val).split('T')[0]
            else:
                formatted_date = '2026-01-01'

            formatted_data.append({
                "id": row.get('id'),
                "product_name": row.get('product_name'),
                "category": row.get('category'),
                "unit_price": int(row.get('unit_price') or 0),
                "quantity": int(row.get('quantity') or 0),
                "total_price": int(row.get('total_price') or 0),
                "sale_date": formatted_date,
                "region": row.get('region') or '未指定'
            })

        # 9. 回傳符合前端 Dashboard 規格的 JSON
        return jsonify({
            "source": source_param,
            "data": formatted_data
        }), 200

    except ValueError as ve:
        return jsonify({
            "error": "環境變數設定錯誤",
            "message": str(ve)
        }), 500

    except Error as db_err:
        return jsonify({
            "error": "MySQL 資料庫查詢失敗",
            "message": str(db_err)
        }), 500

    except Exception as ex:
        return jsonify({
            "error": "伺服器內部錯誤",
            "message": str(ex)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()

if __name__ == '__main__':
    # 預設運行於 5000 Port，支援跨主機存取
    port = int(os.getenv('PORT', 5000))
    print(f"[*] Sales Dashboard Flask API 啟動中，監聽 port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)
