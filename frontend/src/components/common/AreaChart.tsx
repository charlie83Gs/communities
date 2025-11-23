import { Component, onMount, onCleanup, createEffect } from 'solid-js';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  Filler,
  ChartConfiguration,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import type { TimeSeriesDataPoint } from '@/types/health.types';

// Register Chart.js components
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Dataset {
  label: string;
  data: TimeSeriesDataPoint[];
  color: string;
}

interface AreaChartProps {
  datasets: Dataset[];
  title?: string;
  yAxisLabel?: string;
  height?: number;
  loading?: boolean;
  stacked?: boolean;
}

export const AreaChart: Component<AreaChartProps> = (props) => {
  let canvasRef: HTMLCanvasElement | undefined;
  let chartInstance: Chart | null = null;

  const prepareChartData = () => {
    return props.datasets.map((dataset, index) => ({
      label: dataset.label,
      data: dataset.data.map((point) => ({
        x: new Date(point.date).getTime(),
        y: point.value,
      })),
      borderColor: dataset.color,
      backgroundColor: dataset.color + '40', // More opacity for area fill
      tension: 0.4,
      fill: props.stacked ? (index === 0 ? 'origin' : '-1') : 'origin',
      pointRadius: 2,
      pointHoverRadius: 4,
      borderWidth: 2,
    }));
  };

  onMount(() => {
    if (!canvasRef) return;

    const ctx = canvasRef.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        datasets: prepareChartData(),
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
            display: true,
            position: 'top',
            labels: {
              color: getComputedStyle(document.documentElement)
                .getPropertyValue('--color-text-primary')
                .trim() || '#1c1917',
              font: {
                size: 12,
              },
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#444',
            borderWidth: 1,
            callbacks: {
              title: (context) => {
                const xValue = context[0].parsed.x;
                if (xValue === null) return '';
                const date = new Date(xValue);
                return date.toLocaleDateString();
              },
              label: (context) => {
                return `${context.dataset.label}: ${context.parsed.y}`;
              },
              afterBody: (context) => {
                // Calculate total from all datasets at this point
                if (props.stacked && context.length > 0) {
                  const total = context.reduce((sum, item) => sum + (item.parsed.y || 0), 0);
                  return `\nTotal: ${total}`;
                }
                return '';
              },
            },
          },
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day',
              displayFormats: {
                day: 'MMM d',
              },
            },
            title: {
              display: true,
              text: 'Date',
              color: getComputedStyle(document.documentElement)
                .getPropertyValue('--color-text-secondary')
                .trim() || '#57534e',
            },
            ticks: {
              color: getComputedStyle(document.documentElement)
                .getPropertyValue('--color-text-secondary')
                .trim() || '#57534e',
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            },
          },
          y: {
            beginAtZero: true,
            stacked: props.stacked,
            title: {
              display: !!props.yAxisLabel,
              text: props.yAxisLabel || '',
              color: getComputedStyle(document.documentElement)
                .getPropertyValue('--color-text-secondary')
                .trim() || '#57534e',
            },
            ticks: {
              color: getComputedStyle(document.documentElement)
                .getPropertyValue('--color-text-secondary')
                .trim() || '#57534e',
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            },
          },
        },
      },
    };

    chartInstance = new Chart(ctx, config);
  });

  createEffect(() => {
    if (chartInstance && !props.loading) {
      chartInstance.data.datasets = prepareChartData();
      chartInstance.update();
    }
  });

  onCleanup(() => {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
  });

  return (
    <div class="bg-white dark:bg-stone-800 rounded-lg shadow-md p-6 border border-stone-200 dark:border-stone-700">
      {props.title && (
        <h3 class="text-lg font-semibold mb-4 text-stone-900 dark:text-stone-100">
          {props.title}
        </h3>
      )}
      <div class="relative" style={{ height: `${props.height || 300}px` }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};
