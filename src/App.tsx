/**
 * 銷售資料分析 Dashboard (真正 HTTP API 串接版)
 *
 * 核心要求落實：
 * 1. 透過 HTTP GET /api/sales 取得後端資料，絕不把資料寫死在前端，亦無假資料取代 API。
 * 2. 嚴格不使用 localStorage，每次載入網頁與按 F5 時皆重新向 /api/sales 請求。
 * 3. 由 API 回傳的 source 屬性動態決定顯示「sales_original_300」或「sales_updated_300」。
 * 4. 前端絕無任何 MySQL 帳號、密碼、Host、Port，亦無使用 mysql2。
 * 5. 保留完整的 Dashboard 統計、Chart.js 圖表與明細表格。
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  CreditCard,
  Package,
  Layers,
  RefreshCw,
  Database,
  FileCode,
  ArrowUpRight,
  AlertCircle,
  ExternalLink,
  Settings2,
} from 'lucide-react';
import { DataSourceType, SalesDashboardData } from './types/sales';
import { fetchSalesData, API_BASE_URL } from './services/salesApi';
import { ChartBarRanking } from './components/ChartBarRanking';
import { ChartLineTrend } from './components/ChartLineTrend';
import { ChartPieDistribution } from './components/ChartPieDistribution';
import { SalesTable } from './components/SalesTable';
import { ApiGuideModal } from './components/ApiGuideModal';

export default function App() {
  const [data, setData] = useState<SalesDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'records'>('overview');

  // 允許使用者在畫面上即時調整 API_BASE_URL (預設使用 src/services/salesApi.ts 定義的值)
  const [customApiUrl, setCustomApiUrl] = useState<string>(API_BASE_URL);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);

  // 獨立的資料載入函式：每次呼叫皆發送真實 HTTP 請求至 GET /api/sales
  const loadData = useCallback(async (sourceParam?: string, baseUrlOverride?: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 真正呼叫 HTTP API，嚴格不使用 localStorage 快取
      const result = await fetchSalesData(sourceParam, baseUrlOverride ?? customApiUrl);
      setData(result);
    } catch (err: any) {
      console.warn('呼叫 /api/sales 失敗:', err);
      setErrorMessage(
        err?.message || '無法連線至後端 API (GET /api/sales)。請確認後端伺服器是否已啟動。'
      );
    } finally {
      setIsLoading(false);
    }
  }, [customApiUrl]);

  // 每次網頁載入與按 F5 時，強制重新呼叫 /api/sales，不讀取任何快取
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 手動重新整理按鈕
  const handleManualRefresh = () => {
    loadData(data?.dataSource);
  };

  // 切換請求特定資料來源 (?source=...)
  const handleRequestSource = (sourceName: DataSourceType) => {
    loadData(sourceName);
  };

  // 當前顯示的資料來源：依據 API 回傳的 source 屬性決定
  const currentDisplayedSource = data?.dataSource || 'sales_original_300 (等待 API 回傳)';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 頂部導覽列 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: 品牌標題 */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                銷售資料分析 Dashboard
              </h1>
              <div className="text-[11px] text-slate-500 hidden sm:block">
                真實 HTTP API 串接架構 · GET /api/sales
              </div>
            </div>
          </div>

          {/* Zone 2: 頁籤導航 */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100/80 rounded-lg">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              總覽分析
            </button>
            <button
              onClick={() => setActiveTab('charts')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'charts'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              圖表視覺化
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'records'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              明細檢視 ({data?.recentRecords.length || 0} 筆)
            </button>
          </nav>

          {/* Zone 3: 動作控制區 */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsConfigOpen((v) => !v)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
              title="設定 API_BASE_URL 網址"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">API 網址</span>
            </button>

            <button
              onClick={() => setIsGuideOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200/60 transition-colors cursor-pointer"
              title="查看後端 API 串接規格說明"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">API 規格</span>
            </button>

            <button
              onClick={handleManualRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              title="重新呼叫 GET /api/sales (無快取)"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
              <span className="hidden sm:inline">重新載入 (F5)</span>
            </button>
          </div>
        </div>

        {/* API_BASE_URL 即時設定列 (抽屜展開) */}
        {isConfigOpen && (
          <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 text-xs">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 max-w-xl flex items-center gap-2">
                <span className="font-semibold text-slate-700 whitespace-nowrap">API_BASE_URL:</span>
                <input
                  type="text"
                  value={customApiUrl}
                  onChange={(e) => setCustomApiUrl(e.target.value)}
                  placeholder="留空即使用同源 /api/sales，或輸入如 http://localhost:5000"
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadData(undefined, customApiUrl)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
                >
                  套用並重新呼叫
                </button>
                <button
                  onClick={() => {
                    setCustomApiUrl(API_BASE_URL);
                    loadData(undefined, API_BASE_URL);
                  }}
                  className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  重設為預設
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 主要內容區 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 資料來源橫幅 (嚴格依據 API 回傳的 source 屬性呈現) */}
        <section className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <Database className="w-4 h-4 text-blue-600" />
                <span>資料庫資料來源：</span>
              </span>
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200 rounded-md">
                目前資料來源：{currentDisplayedSource}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              前端每次按 F5 或載入皆真正呼叫 <code className="text-blue-700 font-mono">GET /api/sales</code>，不使用 localStorage 快取，由後端 API 回傳的 source 決定顯示項目。
            </p>
          </div>

          {/* 預留切換請求（可帶 query 參數向後端要求切換資料表） */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-500 font-medium">切換 API 請求：</span>
            <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200/80">
              <button
                type="button"
                onClick={() => handleRequestSource('sales_original_300')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  data?.dataSource === 'sales_original_300'
                    ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="呼叫 GET /api/sales?source=sales_original_300"
              >
                sales_original_300
              </button>
              <button
                type="button"
                onClick={() => handleRequestSource('sales_updated_300')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  data?.dataSource === 'sales_updated_300'
                    ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="呼叫 GET /api/sales?source=sales_updated_300"
              >
                sales_updated_300
              </button>
            </div>
          </div>
        </section>

        {/* 若 API 連線錯誤或 API 尚未啟動，顯示清晰的指引狀態 (不使用假資料偽裝) */}
        {errorMessage && (
          <section className="bg-amber-50/90 border border-amber-200 rounded-xl p-5 shadow-2xs">
            <div className="flex items-start gap-3.5">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-2 text-xs text-amber-900">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-amber-950">
                    目前尚未連線至後端 HTTP API (GET /api/sales)
                  </h3>
                  <span className="text-[11px] text-amber-700 font-mono">
                    目標端點：{customApiUrl || '(同源)'}/api/sales
                  </span>
                </div>
                <p className="leading-relaxed">
                  系統已遵照指示移除所有寫死假資料，目前前端在網頁載入時已真正對後端發送 HTTP 請求。若您的獨立後端伺服器尚未啟動，請啟動後端伺服器（例如 Node.js Express、Python 等）。
                </p>
                <div className="bg-amber-100/70 p-2.5 rounded-lg font-mono text-[11px] text-amber-800">
                  伺服器回應訊息：{errorMessage}
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={() => loadData()}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-lg font-medium transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>立即重新連線 (重試)</span>
                  </button>
                  <button
                    onClick={() => setIsGuideOpen(true)}
                    className="inline-flex items-center gap-1 text-amber-800 hover:underline font-medium cursor-pointer"
                  >
                    <span>查看 API 回傳格式與後端 Express 範例</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 核心指標卡片區 (銷售總額、銷售筆數、總銷量、平均單價) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. 銷售總額 */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
              <span className="font-medium">銷售總額 (Total Revenue)</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums tracking-tight">
              {isLoading ? (
                <div className="h-8 w-32 bg-slate-100 animate-pulse rounded" />
              ) : data ? (
                `NT$ ${data.totalRevenue.toLocaleString('zh-TW')}`
              ) : (
                '--'
              )}
            </div>
            <div className="mt-2.5 flex items-center text-[11px] text-slate-500">
              <span className="text-emerald-600 font-medium inline-flex items-center gap-0.5 mr-1.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> 即時統計
              </span>
              <span>由 API 回傳資料彙整</span>
            </div>
          </div>

          {/* 2. 銷售筆數 */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
              <span className="font-medium">銷售筆數 (Total Orders)</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums tracking-tight">
              {isLoading ? (
                <div className="h-8 w-24 bg-slate-100 animate-pulse rounded" />
              ) : data ? (
                `${data.totalOrders.toLocaleString('zh-TW')} 筆`
              ) : (
                '--'
              )}
            </div>
            <div className="mt-2.5 text-[11px] text-slate-500">
              {data ? `資料筆數：${data.totalOrders} 筆` : '待 API 提供'}
            </div>
          </div>

          {/* 3. 總銷售件數 */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
              <span className="font-medium">商品總銷量 (Items Sold)</span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums tracking-tight">
              {isLoading ? (
                <div className="h-8 w-24 bg-slate-100 animate-pulse rounded" />
              ) : data ? (
                `${data.totalItemsSold.toLocaleString('zh-TW')} 件`
              ) : (
                '--'
              )}
            </div>
            <div className="mt-2.5 text-[11px] text-slate-500">
              {data ? `平均每筆約 ${(Number(data.totalItemsSold) / Number(data.totalOrders || 1)).toFixed(1)} 件` : '待 API 提供'}
            </div>
          </div>

          {/* 4. 平均客單價 */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
              <span className="font-medium">平均訂單金額 (AOV)</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums tracking-tight">
              {isLoading ? (
                <div className="h-8 w-28 bg-slate-100 animate-pulse rounded" />
              ) : data ? (
                `NT$ ${data.averageOrderValue.toLocaleString('zh-TW')}`
              ) : (
                '--'
              )}
            </div>
            <div className="mt-2.5 text-[11px] text-slate-500">
              更新時間：{data?.updatedAt || '--:--:--'}
            </div>
          </div>
        </section>

        {/* 圖表視覺化區 (Chart.js) */}
        {(activeTab === 'overview' || activeTab === 'charts') && (
          <section className="space-y-6">
            {/* 上半部：銷售趨勢折線圖 + 商品銷售比例圓餅圖 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 銷售趨勢折線圖 (佔 2 欄) */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">銷售趨勢折線圖</h2>
                    <p className="text-xs text-slate-500">
                      以日期為軸統計每日營收變化（Chart.js Line Chart）
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {data?.salesTrend.length || 0} 個時間點
                  </span>
                </div>

                {isLoading ? (
                  <div className="h-80 bg-slate-50 animate-pulse rounded-lg flex items-center justify-center text-slate-400 text-xs">
                    正在載入折線圖...
                  </div>
                ) : data && data.salesTrend.length > 0 ? (
                  <ChartLineTrend data={data.salesTrend} />
                ) : (
                  <div className="h-80 bg-slate-50 rounded-lg flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
                    <TrendingUp className="w-8 h-8 text-slate-300" />
                    <span>尚未取得趨勢資料，等待後端 API 連線</span>
                  </div>
                )}
              </div>

              {/* 商品銷售比例圓餅圖 (佔 1 欄) */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">商品銷售比例圓餅圖</h2>
                    <p className="text-xs text-slate-500">
                      各商品分類佔比（Chart.js Doughnut Chart）
                    </p>
                  </div>
                </div>

                {isLoading ? (
                  <div className="h-80 bg-slate-50 animate-pulse rounded-lg flex items-center justify-center text-slate-400 text-xs">
                    正在載入圓餅圖...
                  </div>
                ) : data && data.categoryDistribution.length > 0 ? (
                  <ChartPieDistribution data={data.categoryDistribution} />
                ) : (
                  <div className="h-80 bg-slate-50 rounded-lg flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
                    <Package className="w-8 h-8 text-slate-300" />
                    <span>尚未取得類別資料，等待後端 API 連線</span>
                  </div>
                )}
              </div>
            </div>

            {/* 下半部：商品銷售排行長條圖 */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">商品銷售排行長條圖</h2>
                  <p className="text-xs text-slate-500">
                    依銷售總額排序熱銷商品（Chart.js Bar Chart）
                  </p>
                </div>
                <div className="text-xs text-slate-500">
                  TOP 暢銷品項
                </div>
              </div>

              {isLoading ? (
                <div className="h-80 bg-slate-50 animate-pulse rounded-lg flex items-center justify-center text-slate-400 text-xs">
                  正在載入長條圖...
                </div>
              ) : data && data.productRanking.length > 0 ? (
                <ChartBarRanking data={data.productRanking} />
              ) : (
                <div className="h-80 bg-slate-50 rounded-lg flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
                  <Layers className="w-8 h-8 text-slate-300" />
                  <span>尚未取得商品排行資料，等待後端 API 連線</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 明細檢視表格 (銷售紀錄預覽與即時搜尋) */}
        {(activeTab === 'overview' || activeTab === 'records') && (
          <section className="space-y-3">
            {isLoading ? (
              <div className="h-64 bg-slate-100 animate-pulse rounded-xl" />
            ) : data ? (
              <SalesTable records={data.recentRecords} dataSource={data.dataSource} />
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
                尚未載入銷售紀錄明細，請啟動後端 API 伺服器並重試。
              </div>
            )}
          </section>
        )}
      </main>

      {/* 頁尾資訊 */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            銷售資料分析 Dashboard · 學校專題作業 (GitHub 專案)
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>真正呼叫 HTTP API：GET /api/sales</span>
            <span>·</span>
            <span>無 localStorage 快取 · F5 即時更新</span>
          </div>
        </div>
      </footer>

      {/* API 串接規格彈窗 */}
      <ApiGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}
