import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { CategoryDistributionItem } from '../types/sales';

interface ChartPieDistributionProps {
  data: CategoryDistributionItem[];
}

// 沉穩現代的高質感配色調色盤
const PALETTE = [
  '#2563eb', // blue
  '#0d9488', // teal
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#10b981', // emerald
  '#64748b', // slate
];

export const ChartPieDistribution: React.FC<ChartPieDistributionProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const labels = data.map((d) => d.category);
    const amounts = data.map((d) => d.amount);
    const colors = PALETTE.slice(0, data.length);

    chartInstanceRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data: amounts,
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%', // 精美環狀圓餅圖
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 14,
              font: { size: 12 },
              color: '#334155',
            },
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
                const idx = context.dataIndex;
                const percentage = data[idx]?.percentage ?? 0;
                return ` ${context.label}：NT$ ${val.toLocaleString('zh-TW')} (${percentage}%)`;
              },
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
    <div className="w-full h-80 relative flex items-center justify-center">
      <canvas ref={canvasRef} />
    </div>
  );
};
