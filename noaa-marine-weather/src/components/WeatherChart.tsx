'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface WeatherForecast {
  date: string;
  temperature: number;
  windSpeed: number;
  windDirection: string;
  waveHeight: number;
  description: string;
  detailedForecast: string;
}

interface WeatherChartProps {
  forecasts: WeatherForecast[];
}

export default function WeatherChart({ forecasts }: WeatherChartProps) {
  const labels = forecasts.map(f => {
    const date = new Date(f.date);
    return format(date, 'MMM d HH:mm');
  });

  const data = {
    labels,
    datasets: [
      {
        label: 'Temperature (°F)',
        data: forecasts.map(f => Math.round(f.temperature)),
        borderColor: '#00ff00',
        backgroundColor: 'rgba(0, 255, 0, 0.1)',
        yAxisID: 'y',
        tension: 0.2,
      },
      {
        label: 'Wind Speed (mph)',
        data: forecasts.map(f => Math.round(f.windSpeed)),
        borderColor: '#00ffff',
        backgroundColor: 'rgba(0, 255, 255, 0.1)',
        yAxisID: 'y1',
        tension: 0.2,
      },
      {
        label: 'Wave Height (ft)',
        data: forecasts.map(f => Math.round(f.waveHeight * 10) / 10),
        borderColor: '#ffff00',
        backgroundColor: 'rgba(255, 255, 0, 0.1)',
        yAxisID: 'y2',
        tension: 0.2,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#00ff00',
          font: {
            family: 'JetBrains Mono, Monaco, Consolas, monospace',
            size: 12,
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#151515',
        titleColor: '#00ffff',
        bodyColor: '#ffffff',
        borderColor: '#333333',
        borderWidth: 1,
        titleFont: {
          family: 'JetBrains Mono, Monaco, Consolas, monospace',
        },
        bodyFont: {
          family: 'JetBrains Mono, Monaco, Consolas, monospace',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#808080',
          font: {
            family: 'JetBrains Mono, Monaco, Consolas, monospace',
            size: 10,
          },
        },
        grid: {
          color: '#333333',
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        ticks: {
          color: '#00ff00',
          font: {
            family: 'JetBrains Mono, Monaco, Consolas, monospace',
            size: 10,
          },
        },
        grid: {
          color: '#333333',
        },
        title: {
          display: true,
          text: 'Temperature (°F)',
          color: '#00ff00',
          font: {
            family: 'JetBrains Mono, Monaco, Consolas, monospace',
            size: 11,
          },
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        ticks: {
          color: '#00ffff',
          font: {
            family: 'JetBrains Mono, Monaco, Consolas, monospace',
            size: 10,
          },
        },
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Wind Speed (mph)',
          color: '#00ffff',
          font: {
            family: 'JetBrains Mono, Monaco, Consolas, monospace',
            size: 11,
          },
        },
      },
      y2: {
        type: 'linear' as const,
        display: false,
        position: 'right' as const,
      },
    },
  };

  return (
    <div className="h-80 w-full">
      <div className="mb-4 grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="text-terminal-success">Temperature</div>
          <div className="text-terminal-muted">°F</div>
        </div>
        <div className="text-center">
          <div className="text-terminal-accent">Wind Speed</div>
          <div className="text-terminal-muted">mph</div>
        </div>
        <div className="text-center">
          <div className="text-terminal-warning">Wave Height</div>
          <div className="text-terminal-muted">feet</div>
        </div>
      </div>
      <Line data={data} options={options} />
    </div>
  );
}