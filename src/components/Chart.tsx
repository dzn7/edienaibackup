'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ChartProps {
  type: 'bar' | 'line' | 'doughnut';
  data: any;
  title?: string;
  height?: number;
}

export const Chart = ({ type, data, title, height = 300 }: ChartProps) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#f8fafc',
        },
      },
      title: {
        display: !!title,
        text: title,
        color: '#f8fafc',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: type !== 'doughnut' ? {
      x: {
        ticks: {
          color: '#94a3b8',
        },
        grid: {
          color: '#334155',
        },
      },
      y: {
        ticks: {
          color: '#94a3b8',
        },
        grid: {
          color: '#334155',
        },
      },
    } : undefined,
  };

  const chartData = {
    ...data,
    datasets: (data.datasets as Record<string, unknown>[])?.map((dataset: Record<string, unknown>) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 101, 101, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
      ],
      borderColor: dataset.borderColor || [
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(245, 101, 101, 1)',
        'rgba(251, 191, 36, 1)',
        'rgba(139, 92, 246, 1)',
        'rgba(236, 72, 153, 1)',
      ],
    })),
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar data={chartData} options={options} />;
      case 'line':
        return <Line data={chartData} options={options} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={options} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative group">
      {/* Gradient Border */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
      
      <div className="relative bg-slate-800/90 border border-slate-600/50 rounded-xl p-6 shadow-2xl backdrop-blur-sm group-hover:shadow-3xl transition-all duration-300">
        <div style={{ height: `${height}px` }}>
          {renderChart()}
        </div>
      </div>
    </div>
  );
};
