'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Title);

interface WorkoutChartProps {
  exercise: string;
  dataPoints: { date: string; weight: number }[];
}

export default function WorkoutChart({ exercise, dataPoints }: WorkoutChartProps) {
  const sorted = [...dataPoints].sort((a, b) => a.date.localeCompare(b.date)); // assumes ISO-ish strings

  const chartData = {
    labels: sorted.map(d => d.date),
    datasets: [
      {
        label: exercise,
        data: sorted.map(d => d.weight),
        borderColor: '#60A5FA',
        backgroundColor: '#60A5FA',
        tension: 0.3,
        fill: false,
        pointRadius: 4,
      },
    ],
  };

  return (
    <div className="min-w-[300px] bg-white/5 p-4 rounded-xl snap-start">
      <h3 className="mb-2 font-semibold">{exercise}</h3>
      <div style={{ height: 200 }}>
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } },
          }}
        />
      </div>
    </div>
  );
}


  

