'use client';

/**
 * Scoring Weights Pie Chart
 * Visualizes the RIS component weights as a pie chart
 */

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useTheme } from '@/components/providers/theme-provider';

ChartJS.register(ArcElement, Tooltip, Legend);

export function ScoringWeightsPieChart() {
  const { effectiveTheme } = useTheme();

  // Use theme-aware colors for labels
  const labelColor = effectiveTheme === 'dark' ? '#e5e7eb' : '#1f2937';

  const data = {
    labels: [
      'Ecosystem Footprint',
      'Contribution Quality',
      'Maintainer Health',
      'Community Benefit',
      'Mission Alignment',
    ],
    datasets: [
      {
        label: 'Weight',
        data: [30, 25, 20, 15, 10], // Percentages
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',   // Blue
          'rgba(34, 197, 94, 0.8)',    // Green
          'rgba(168, 85, 247, 0.8)',   // Purple
          'rgba(234, 179, 8, 0.8)',    // Yellow
          'rgba(236, 72, 153, 0.8)',   // Pink
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(236, 72, 153, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: labelColor,
          font: {
            size: 12,
          },
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: { label: string; parsed: number }) {
            return `${context.label}: ${context.parsed}%`;
          }
        }
      }
    },
  };

  return (
    <div className="mx-auto max-w-md">
      <Pie data={data} options={options} />
    </div>
  );
}
