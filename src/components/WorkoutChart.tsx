"use client";

import { useMemo } from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Title,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
  Filler
);

type DataPoint = {
  date: string; // ISO-ish string like "2025-08-04"
  weight: number;
};

interface WorkoutChartProps {
  exercise: string;
  dataPoints: DataPoint[];
}

const formatLabel = (raw: string) => {
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return raw;
  }
};

export default function WorkoutChart({
  exercise,
  dataPoints,
}: WorkoutChartProps) {
  const sorted = useMemo(() => {
    return [...dataPoints].sort((a, b) => a.date.localeCompare(b.date));
  }, [dataPoints]);

  const chartData = useMemo(() => {
    return {
      labels: sorted.map((d) => formatLabel(d.date)),
      datasets: [
        {
          label: exercise,
          data: sorted.map((d) => d.weight),
          borderColor: "#60A5FA",
          backgroundColor: "rgba(96, 165, 250, 0.2)",
          tension: 0.3,
          fill: false,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: "#60A5FA",
          borderWidth: 2,
        },
      ],
    };
  }, [exercise, sorted]);

  const options = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "nearest" as const,
        intersect: false,
      },
      plugins: {
        legend: {
          display: false as const,
        },
        title: {
          display: false as const,
        },
        tooltip: {
          callbacks: {
            label: (ctx: any) => {
              const val = ctx.parsed.y;
              return `${val} lbs`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true as const,
          ticks: {
            stepSize: 20,
            callback: (val: any) => `${val}`,
          },
          grid: {
            drawBorder: false,
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
    };
  }, []);

  // If there is no data, show a placeholder
  if (!dataPoints || dataPoints.length === 0) {
    return (
      <div className="min-w-[300px] bg-white/5 p-4 rounded-xl snap-start flex flex-col">
        <h3 className="mb-2 font-semibold">{exercise}</h3>
        <div
          className="flex-1 flex items-center justify-center text-sm text-gray-400"
          aria-label={`No data for ${exercise}`}
        >
          No data yet
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-w-[300px] bg-white/5 p-4 rounded-xl snap-start"
      aria-label={`${exercise} progress chart`}
    >
      <h3 className="mb-2 font-semibold">{exercise}</h3>
      <div style={{ height: 200, position: "relative" }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

  

