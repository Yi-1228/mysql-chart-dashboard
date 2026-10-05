import React, { useState } from 'react';
import { SaleRecord } from '../types/sales';
import { Search, Download, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface SalesTableProps {
  records: SaleRecord[];
  dataSource: string;
}

export const SalesTable: React.FC<SalesTableProps> = ({ records, dataSource }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const filteredRecords = records.filter(
    (r) =>
      r.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(r.id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentRecords = filteredRecords.slice(startIndex, startIndex + pageSize);

  const handleExportCSV = () => {
    const headers = ['訂單編號', '商品名稱', '商品類別', '單價', '數量', '銷售金額', '銷售日期', '區域'];
    const rows = filteredRecords.map((r) => [
      r.id,
      `"${r.productName}"`,
      r.category,
      r.unitPrice,
      r.quantity,
      r.totalPrice,
      r.saleDate,
      r.region || '未指定',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${dataSource}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">銷售紀錄明細預覽</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            共 {filteredRecords.length} 筆記錄 · 即時搜尋與分頁檢視
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="搜尋商品、類別或編號..."
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white w-48 sm:w-60 transition-all"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            title="匯出篩選結果為 CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>匯出 CSV</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-medium">
              <th className="py-3 px-4">訂單編號</th>
              <th className="py-3 px-4">商品名稱</th>
              <th className="py-3 px-4">類別</th>
              <th className="py-3 px-4 text-right">單價 (NT$)</th>
              <th className="py-3 px-4 text-right">數量</th>
              <th className="py-3 px-4 text-right">總金額 (NT$)</th>
              <th className="py-3 px-4">銷售日期</th>
              <th className="py-3 px-4">銷售地區</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentRecords.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                  查無符合「{searchTerm}」的銷售資料
                </td>
              </tr>
            ) : (
              currentRecords.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-4 font-mono text-slate-500">{item.id}</td>
                  <td className="py-2.5 px-4 font-medium text-slate-900">{item.productName}</td>
                  <td className="py-2.5 px-4 text-slate-600">{item.category}</td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-700">
                    {item.unitPrice.toLocaleString('zh-TW')}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-700">
                    {item.quantity}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                    {item.totalPrice.toLocaleString('zh-TW')}
                  </td>
                  <td className="py-2.5 px-4 text-slate-500 font-mono">{item.saleDate}</td>
                  <td className="py-2.5 px-4 text-slate-600">{item.region || '標準'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
          <span>
            第 {currentPage} 頁 / 共 {totalPages} 頁 (每頁 {pageSize} 筆)
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
