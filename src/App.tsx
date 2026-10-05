export const API_BASE_URL = '';

export interface SaleRecord {
  id: string;
  productName: string;
  category: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  saleDate: string;
  region: string;
}

export interface SalesDashboardData {
  totalRevenue: number;
  totalItemsSold: number;
  productRanking: {
    name: string;
    revenue: number;
  }[];
  categoryDistribution: {
    name: string;
    revenue: number;
  }[];
  salesTrend: {
    date: string;
    revenue: number;
  }[];
  recentRecords: SaleRecord[];
  source: string;
}

function parseCSV(text: string): SaleRecord[] {
  text = text.replace(/^\uFEFF/, '');

  const lines = text.trim().split(/\r?\n/);

  if (lines.length < 2) {
    return [];
  }

  const headers = lines[0].split(',').map(h => h.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(',');

    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = (values[index] || '').trim();
    });

    const quantity = Number(row.quantity || 0);
    const returnedQuantity = Number(row.returned_quantity || 0);
    const unitPrice = Number(row.unit_price || 0);

    return {
      id: row.sale_id || '',
      productName: row.product_name || '',
      category: row.category || '',
      unitPrice,
      quantity,
      totalPrice: unitPrice * (quantity - returnedQuantity),
      saleDate: row.sale_date || '',
      region: row.channel || '',
    };
  });
}

function processRawSalesData(
  records: SaleRecord[],
  source: string
): SalesDashboardData {

  const totalRevenue = records.reduce(
    (sum, record) => sum + record.totalPrice,
    0
  );

  const totalItemsSold = records.reduce(
    (sum, record) => sum + record.quantity,
    0
  );

  const productMap: Record<string, number> = {};

  records.forEach(record => {
    productMap[record.productName] =
      (productMap[record.productName] || 0) + record.totalPrice;
  });

  const productRanking = Object.entries(productMap)
    .map(([name, revenue]) => ({
      name,
      revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const categoryMap: Record<string, number> = {};

  records.forEach(record => {
    categoryMap[record.category] =
      (categoryMap[record.category] || 0) + record.totalPrice;
  });

  const categoryDistribution = Object.entries(categoryMap)
    .map(([name, revenue]) => ({
      name,
      revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const dateMap: Record<string, number> = {};

  records.forEach(record => {
    dateMap[record.saleDate] =
      (dateMap[record.saleDate] || 0) + record.totalPrice;
  });

  const salesTrend = Object.entries(dateMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({
      date,
      revenue,
    }));

  return {
    totalRevenue,
    totalItemsSold,
    productRanking,
    categoryDistribution,
    salesTrend,
    recentRecords: records.slice(-20).reverse(),
    source,
  };
}

export async function fetchSalesData(
  source: string = 'sales_original_300'
): Promise<SalesDashboardData> {

  const fileName =
    source === 'sales_updated_300'
      ? 'sales_updated_300.csv'
      : 'sales_original_300.csv';

  const response = await fetch(
    `${import.meta.env.BASE_URL}data/${fileName}`,
    {
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error(
      `找不到資料檔案：${fileName}（HTTP ${response.status}）`
    );
  }

  const csvText = await response.text();

  const records = parseCSV(csvText);

  if (records.length === 0) {
    throw new Error(`CSV 資料是空的：${fileName}`);
  }

  return processRawSalesData(records, source);
}
