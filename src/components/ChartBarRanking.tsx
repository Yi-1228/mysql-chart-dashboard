import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { ProductRankingItem } from '../types/sales';

interface ChartBarRankingProps {
  data: ProductRankingItem[];
}

export const ChartBarRanking: React.FC<ChartBarRankingProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // 若先前已有 Chart instance，先予以銷毀避免重複疊加
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // 取前 7 名產品以維持最佳視覺體驗
    const displayData = data.slice(0, 7);
    const labels = displayData.map((d) => d.productName);
    const revenues = displayData.map((d) => d.totalRevenue);

    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: '銷售總額 (NT$)',
            data: revenues,
            backgroundColor: 'rgba(59, 130, 246, 0.85)',
            hoverBackgroundColor: 'rgba(37, 99, 235, 1)',
            borderRadius: 6,
            borderSkipped: false,
            barThickness: 22,
          },
        ],
      },
      options: {
        indexAxis: 'y', // 水平長條圖，商品名稱清晰易讀
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleFont: { size: 13, weight: 'bold' },
            bodyFont: { size: 12 },
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const val = context.raw as number;
                const item = displayData[context.dataIndex];
                return [
                  ` 銷售總額：NT$ ${val.toLocaleString('zh-TW')}`,
                  ` 銷售總量：${item.totalQuantity} 件`,
                ];
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(226, 232, 240, 0.8)',
            },
            ticks: {
              font: { family: 'JetBrains Mono, monospace', size: 11 },
              callback: (value) => `NT$ ${(Number(value) / 1000).toFixed(0)}k`,
            },
          },
          y: {
            grid: {
              display: false,
            },
            ticks: {
              font: { size: 12 },
              color: '#334155',
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [data]);

  return (
    <div className="w-full h-80 relative">
      <canvas ref={canvasRef} />
    </div>
  );
};
