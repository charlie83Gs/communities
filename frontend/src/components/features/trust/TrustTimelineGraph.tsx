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
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import type { TrustTimelineEvent } from '@/types/user.types';
import { makeTranslator } from '@/i18n/makeTranslator';
import { myTrustDict } from '@/pages/protected/my-trust.i18n';

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
  Legend
);

interface TrustTimelineGraphProps {
  events: TrustTimelineEvent[];
  loading: boolean;
}

interface ChartDataPoint {
  x: string;
  y: number;
  communityName: string;
}

export const TrustTimelineGraph: Component<TrustTimelineGraphProps> = (props) => {
  const t = makeTranslator(myTrustDict, 'myTrust');
  let canvasRef: HTMLCanvasElement | undefined;
  let chartInstance: Chart | null = null;

  const prepareChartData = (events: TrustTimelineEvent[]) => {
    // Group events by community
    const communitiesMap = new Map<string, ChartDataPoint[]>();

    // Process events in chronological order (oldest first)
    const sortedEvents = [...events].reverse();

    sortedEvents.forEach((event) => {
      const communityId = event.communityId;
      if (!communitiesMap.has(communityId)) {
        communitiesMap.set(communityId, []);
      }

      communitiesMap.get(communityId)!.push({
        x: event.timestamp,
        y: event.cumulativeTrust,
        communityName: event.communityName,
      });
    });

    // Convert to Chart.js datasets
    const colors = [
      '#3b82f6', // blue
      '#10b981', // green
      '#f59e0b', // amber
      '#ef4444', // red
      '#8b5cf6', // purple
      '#ec4899', // pink
    ];

    const datasets = Array.from(communitiesMap.entries()).map(([communityId, dataPoints], index) => {
      const color = colors[index % colors.length];
      const communityName = dataPoints[0]?.communityName || 'Unknown';

      return {
        label: communityName,
        data: dataPoints,
        borderColor: color,
        backgroundColor: color + '20',
        tension: 0.4,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6,
      };
    });

    return datasets;
  };

  onMount(() => {
    if (!canvasRef) return;

    const ctx = canvasRef.getContext('2d');
    if (!ctx) return;

    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: prepareChartData(props.events),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false,
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          tooltip: {
            callbacks: {
              title: (context) => {
                const date = new Date(context[0].parsed.x);
                return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
              },
              label: (context) => {
                return `${context.dataset.label}: ${context.parsed.y} ${t('points')}`;
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
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: t('trustPoints'),
            },
            ticks: {
              stepSize: 1,
            },
          },
        },
      },
    });
  });

  createEffect(() => {
    if (chartInstance && !props.loading) {
      chartInstance.data.datasets = prepareChartData(props.events);
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
      <h2 class="text-xl font-semibold mb-6 text-stone-900 dark:text-stone-100">{t('graphTitle')}</h2>
      <div class="relative h-[200px]">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};
