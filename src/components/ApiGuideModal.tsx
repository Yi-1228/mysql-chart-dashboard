import React from 'react';
import { X, CheckCircle2, ShieldAlert, Server, Database, Code2 } from 'lucide-react';

interface ApiGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiGuideModal: React.FC<ApiGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-slate-200 shadow-xl">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
              API
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">後端 HTTP API 串接規格指引</h2>
              <p className="text-xs text-slate-500">
                GET /api/sales 規格說明與 MySQL 後端範例
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-sm text-slate-700">
          {/* 安全守則強調 */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-900">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-semibold block mb-1">資安守則：前端絕不可直接存取 MySQL</span>
              前端網頁的 JavaScript 在訪客瀏覽器端完全可被檢視。若在前端使用 mysql2 或填寫資料庫密碼，將導致資料庫帳密外洩。因此必須由獨立後端 API 伺服器連接 MySQL，前端僅向 HTTP API 請求 JSON 資料。
            </div>
          </div>

          {/* 三層式架構圖 */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              系統資料流向圖示
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <Code2 className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
                <div className="font-semibold text-xs text-slate-800">1. 前端 Dashboard</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  每次載入/F5 即時呼叫<br />
                  <code className="text-blue-700 font-mono">GET /api/sales</code>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <Server className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
                <div className="font-semibold text-xs text-slate-800">2. 獨立後端伺服器 (API)</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Node.js / Python / Go<br />
                  安全持有 DB 帳密連線
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <Database className="w-5 h-5 text-indigo-600 mx-auto mb-1.5" />
                <div className="font-semibold text-xs text-slate-800">3. MySQL 資料庫</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  sales_original_300<br />
                  sales_updated_300
                </div>
              </div>
            </div>
          </div>

          {/* API 規格定義 */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              API 端點與回傳格式規範 (GET /api/sales)
            </h3>

            <div className="bg-slate-900 text-slate-200 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
              <div className="text-slate-400 mb-1">// API 回傳格式 (前端依據 source 欄位決定顯示的資料來源)：</div>
              &#123;<br />
              &nbsp;&nbsp;<span className="text-emerald-300">"source"</span>: <span className="text-amber-300">"sales_original_300"</span>, <span className="text-slate-500">// 或 "sales_updated_300"</span><br />
              &nbsp;&nbsp;<span className="text-emerald-300">"data"</span>: [<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&#123;<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-300">"id"</span>: <span className="text-purple-300">1</span>,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-300">"product_name"</span>: <span className="text-amber-300">"旗艦級 15吋筆記型電腦"</span>,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-300">"category"</span>: <span className="text-amber-300">"電腦設備"</span>,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-300">"unit_price"</span>: <span className="text-purple-300">38900</span>,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-300">"quantity"</span>: <span className="text-purple-300">2</span>,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-300">"total_price"</span>: <span className="text-purple-300">77800</span>,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-300">"sale_date"</span>: <span className="text-amber-300">"2026-03-15"</span>,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-300">"region"</span>: <span className="text-amber-300">"北部地區"</span><br />
              &nbsp;&nbsp;&nbsp;&nbsp;&#125;...<br />
              &nbsp;&nbsp;]<br />
              &#125;
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>API 設定位置：</strong> 在 <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">src/services/salesApi.ts</code> 頂端可指定 <code className="text-blue-600 font-mono">API_BASE_URL</code>（例如 <code className="font-mono">http://localhost:5000</code> 或留空）。
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>無快取保證：</strong> 請求帶有 <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">cache: 'no-store'</code>，每次重新整理 (F5) 皆會重發 GET 請求。
                </span>
              </div>
            </div>

            {/* 後端範例代碼 */}
            <div className="mt-3 bg-slate-900 text-slate-200 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
              <div className="text-slate-400 mb-1">// 後端 Node.js Express 伺服器範例 (請運行於後端專案)：</div>
              <span className="text-purple-400">app</span>.<span className="text-blue-300">get</span>(<span className="text-emerald-300">'/api/sales'</span>, <span className="text-purple-400">async</span> (req, res) =&gt; &#123;<br />
              &nbsp;&nbsp;<span className="text-amber-300">const</span> source = req.query.source === <span className="text-emerald-300">'sales_updated_300'</span> ? <span className="text-emerald-300">'sales_updated_300'</span> : <span className="text-emerald-300">'sales_original_300'</span>;<br />
              &nbsp;&nbsp;<span className="text-amber-300">const</span> [rows] = <span className="text-purple-400">await</span> mysqlPool.query(<span className="text-emerald-300">`SELECT * FROM $&#123;source&#125;`</span>);<br />
              &nbsp;&nbsp;res.json(&#123; <span className="text-emerald-300">source</span>: source, <span className="text-emerald-300">data</span>: rows &#125;);<br />
              &#125;);
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 flex justify-end bg-slate-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
