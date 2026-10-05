/**
 * 銷售資料型別定義
 * 定義 API 回傳格式、單筆銷售紀錄與彙整後的儀表板資料格式
 */

export type DataSourceType = 'sales_original_300' | 'sales_updated_300' | string;

/**
 * 後端 HTTP API 回傳規格：GET /api/sales
 * 回傳範例：
 * {
 *   "source": "sales_original_300",
 *   "data": [...]
 * }
 */
export interface SalesApiResponse {
  source: DataSourceType;
  data: any[];
}

export interface SaleRecord {
  id: string | number;
  productName: string;
  category: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  saleDate: string; // YYYY-MM-DD
  region?: string;
}

export interface ProductRankingItem {
  productName: string;
  totalRevenue: number;
  totalQuantity: number;
}

export interface SalesTrendItem {
  date: string;
  amount: number;
  ordersCount: number;
}

export interface CategoryDistributionItem {
  category: string;
  amount: number;
  percentage: number;
}

export interface SalesDashboardData {
  dataSource: DataSourceType;
  totalRevenue: number;
  totalOrders: number;
  totalItemsSold: number;
  averageOrderValue: number;
  productRanking: ProductRankingItem[];
  salesTrend: SalesTrendItem[];
  categoryDistribution: CategoryDistributionItem[];
  recentRecords: SaleRecord[];
  updatedAt: string;
}
