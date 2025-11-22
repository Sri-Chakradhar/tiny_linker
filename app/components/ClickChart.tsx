"use client";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip
);

export default function ClickChart({ urlId }: { urlId: string }) {
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/links/${urlId}/stats`)
      .then((res) => res.json())
      .then(setStats);
  }, [urlId]);

  const data = {
    labels: stats.map((s) => s.date),
    datasets: [
      {
        label: "Clicks per day",
        data: stats.map((s) => s.count),
        borderColor: "black",
        tension: 0.3,
      },
    ],
  };

  return <Line data={data} />;
}
