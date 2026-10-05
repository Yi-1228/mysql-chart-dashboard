import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { SalesTrendItem } from '../types/sales';

interface ChartLineTrendProps {
  data: SalesTrendItem[];
}

export const ChartLineTrend: React.FC<ChartLineTrendProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // 建立微漸層效果
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(14, 165, 233, 0.28)');
    gradient.addColorStop(1, 'rgba(14, 165, 233, 0.01)');

    const labels = data.map((d) => d.date.slice(5)); // 顯示 MM-DD
    const amounts = data.map((d) => d.amount);

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: '每日銷售額',
            data: amounts,
            borderColor: '#0284c7',
            backgroundColor: gradient,
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#0284c7',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
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
              title: (items) => {
                const idx = items[0].dataIndex;
                return `日期：${data[idx].date}`;
              },
              label: (context) => {
                const val = context.raw as number;
                const idx = context.dataIndex;
                return [
                  ` 當日銷售：NT$ ${val.toLocaleString('zh-TW')}`,
                  ` 訂單筆數：${data[idx].ordersCount} 筆`,
                ];
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: { family: 'JetBrains Mono, monospace', size: 11 },
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 10,
            },
          },
          y: {
            grid: {
              color: 'rgba(226, 232, 240, 0.8)',
            },
            ticks: {
              font: { family: 'JetBrains Mono, monospace', size: 11 },
              callback: (value) => `NT$ ${(Number(value) / 1000).toFixed(0)}k`,
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
