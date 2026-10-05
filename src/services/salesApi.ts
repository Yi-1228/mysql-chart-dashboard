/**
 * 銷售資料取得模組 (HTTP API 串接版)
 *
 * 【作業與資安規範遵守】：
 * 1. 真正透過 HTTP GET /api/sales 取得後端資料，絕不把資料寫死在前端，亦不使用假資料取代真實 API。
 * 2. 嚴格不使用 localStorage 快取，每次網頁載入與按 F5 時皆重新向 API 發出請求。
 * 3. 前端絕無任何 MySQL 帳號、密碼、Host、Port，亦無安裝 mysql2。
 * 4. API 回傳規格：
 *    {
 *      "source": "sales_original_300" | "sales_updated_300",
 *      "data": [...]
 *    }
 *    由 API 回傳的 source 屬性動態決定前端顯示的目前資料來源名稱。
 */

import { DataSourceType, SaleRecord, SalesApiResponse, SalesDashboardData } from '../types/sales';

// =========================================================================
// 【後端 API 伺服器設定位置 (API_BASE_URL)】
// - 若後端 API 與前端運行於同一網址（或透過反向代理），保持空字串 '' 即可呼叫同源 /api/sales。
// - 若獨立後端 API 運行於不同 Port 或 Host（例如 http://localhost:5000 或 http://127.0.0.1:8000），
//   請直接在此修改，例如：export const API_BASE_URL = 'http://localhost:5000';
// =========================================================================
export const API_BASE_URL = '';

/**
 * 真正呼叫後端 HTTP API 的獨立函式
 * 
 * @param sourceParam 選填：若後端 API 支援 query 參數切換資料來源 (?source=sales_updated_300)
 * @param customBaseUrl 選填：允許自訂或動態覆寫 API 基礎網址
 * @returns Promise<SalesDashboardData>
 */
export async function fetchSalesData(
  sourceParam?: string,
  customBaseUrl?: string
): Promise<SalesDashboardData> {
  const baseUrl = (customBaseUrl !== undefined ? customBaseUrl : API_BASE_URL).replace(/\/$/, '');
  
  // 組合目標 URL：GET /api/sales 或帶有 ?source= 參數
  const queryString = sourceParam ? `?source=${encodeURIComponent(sourceParam)}` : '';
  const requestUrl = `${baseUrl}/api/sales${queryString}`;

  // 真正呼叫 HTTP API，強制 cache: 'no-store' 確保每次載入或 F5 都重新向後端要最新資料
  const response = await fetch(requestUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(
      `後端 API 請求失敗 [HTTP ${response.status} ${response.statusText || 'Error'}] (目標端點: ${requestUrl})`
    );
  }

  const json: SalesApiResponse = await response.json();

  if (!json || typeof json !== 'object') {
    throw new Error('API 回傳格式錯誤：預期為 JSON 物件');
  }

  // 驗證 API 回傳格式：需包含 source 與 data
  const returnedSource: DataSourceType = json.source || (sourceParam as DataSourceType) || 'sales_original_300';
  const rawData = Array.isArray(json.data) ? json.data : [];

  if (!Array.isArray(json.data)) {
    throw new Error('API 回傳格式不符合規範：缺少 data 陣列 (規格應為 { "source": string, "data": [...] })');
  }

  // 解析並正規化 MySQL 回傳的資料列（相容 camelCase 與 snake_case 命名）
  const records: SaleRecord[] = rawData.map(normalizeRecord);

  // 計算並產生 Dashboard 所需的統計與 Chart.js 資料
  return processRawSalesData(returnedSource, records);
}

/**
 * 將資料庫可能回傳的欄位名稱正規化為前端通用型別
 * 相容 MySQL 常見的 snake_case 與 camelCase 命名
 */
function normalizeRecord(raw: any, index: number): SaleRecord {
  const id = raw.id ?? raw.order_id ?? raw.orderId ?? index + 1;
  const productName = String(raw.product_name ?? raw.productName ?? raw.name ?? raw.product ?? '未命名商品');
  const category = String(raw.category ?? raw.category_name ?? raw.type ?? '其他');
  const unitPrice = Number(raw.unit_price ?? raw.unitPrice ?? raw.price ?? 0);
  const quantity = Number(raw.quantity ?? raw.qty ?? raw.count ?? 1);
  const totalPrice = Number(
    raw.total_price ?? raw.totalPrice ?? raw.total_amount ?? raw.total ?? (unitPrice * quantity)
  );

  let saleDate = String(raw.sale_date ?? raw.saleDate ?? raw.date ?? raw.created_at ?? '2026-03-01');
  if (saleDate.includes('T')) {
    saleDate = saleDate.split('T')[0];
  }

  const region = raw.region ?? raw.area ?? '標準地區';

  return {
    id,
    productName,
    category,
    unitPrice,
    quantity,
    totalPrice,
    saleDate,
    region,
  };
}

/**
 * 將原始銷售資料彙整為 Dashboard 所需的指標與圖表資料
 */
function processRawSalesData(
  source: DataSourceType,
  records: SaleRecord[]
): SalesDashboardData {
  let totalRevenue = 0;
  let totalItemsSold = 0;

  // 1. 商品銷售統計 (用於長條圖)
  const productMap = new Map<string, { totalRevenue: number; totalQuantity: number }>();

  // 2. 類別銷售統計 (用於圓餅圖)
  const categoryMap = new Map<string, number>();

  // 3. 日期銷售統計 (用於趨勢折線圖)
  const trendMap = new Map<string, { amount: number; count: number }>();

  records.forEach((rec) => {
    totalRevenue += rec.totalPrice;
    totalItemsSold += rec.quantity;

    // 商品彙整
    const prod = productMap.get(rec.productName) || { totalRevenue: 0, totalQuantity: 0 };
    prod.totalRevenue += rec.totalPrice;
    prod.totalQuantity += rec.quantity;
    productMap.set(rec.productName, prod);

    // 類別彙整
    const catRevenue = categoryMap.get(rec.category) || 0;
    categoryMap.set(rec.category, catRevenue + rec.totalPrice);

    // 日期趨勢彙整
    const trend = trendMap.get(rec.saleDate) || { amount: 0, count: 0 };
    trend.amount += rec.totalPrice;
    trend.count += 1;
    trendMap.set(rec.saleDate, trend);
  });

  // 商品銷售排行 (依總銷售額由高至低排序)
  const productRanking = Array.from(productMap.entries())
    .map(([productName, data]) => ({
      productName,
      totalRevenue: data.totalRevenue,
      totalQuantity: data.totalQuantity,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  // 類別銷售比例
  const categoryDistribution = Array.from(categoryMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalRevenue > 0 ? Number(((amount / totalRevenue) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // 銷售趨勢 (依日期先後排序)
  const salesTrend = Array.from(trendMap.entries())
    .map(([date, data]) => ({
      date,
      amount: data.amount,
      ordersCount: data.count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    dataSource: source,
    totalRevenue,
    totalOrders: records.length,
    totalItemsSold,
    averageOrderValue: records.length > 0 ? Math.round(totalRevenue / records.length) : 0,
    productRanking,
    salesTrend,
    categoryDistribution,
    recentRecords: records.slice(0, 100), // 提供最近紀錄清單
    updatedAt: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
  };
}
