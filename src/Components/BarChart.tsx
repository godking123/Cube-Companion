import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { useState, useEffect } from "react";
import { ChartData } from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

import { Time } from "./Stopwatch.tsx";

function BarChart() {
  const [data, setData] = useState<ChartData<"bar"> | null>(null);

  useEffect(() => {
    const storedArray = localStorage.getItem("times");
    const times: Time[] = storedArray
      ? JSON.parse(storedArray).map(
          (t: { scramble: string; elapsedTime: number; type: string }) =>
            new Time(t.scramble, t.elapsedTime, t.type)
        )
      : [];

    const typeSolveTimes: Record<string, number[]> = {};
    times.forEach((t) => {
      if (!typeSolveTimes[t.type]) typeSolveTimes[t.type] = [];
      typeSolveTimes[t.type].push(t.elapsedTime);
    });

    const labels = Object.keys(typeSolveTimes);
    const avgSolveTimes = labels.map(
      (type) =>
        typeSolveTimes[type].reduce((sum, time) => sum + time, 0) /
        typeSolveTimes[type].length /
        1000
    );

    setData({
      labels,
      datasets: [
        {
          label: "Average Solve Time (seconds)",
          data: avgSolveTimes,
          backgroundColor: [
            "rgb(255, 63, 105)",
            "rgb(62, 164, 231)",
            "rgb(255, 211, 98)",
            "rgb(79, 88, 211)",
            "rgb(167, 127, 247)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgb(79, 88, 211)",
            "rgba(153, 102, 255, 1)",
          ],
          borderWidth: 1,
        },
      ],
    });
  }, []);

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend
        labels: {
          font: {
            family: "League Spartan",
            size: 14,
          },
          color: "white",
        },
      },
      title: {
        display: true,
        text: "Average Solve Time per Cube Type",
        font: {
          family: "League Spartan",
          size: 18,
          weight: "bold",
        },
        color: "white",
      },
      tooltip: {
        titleFont: {
          family: "League Spartan",
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          family: "League Spartan",
          size: 12,
          weight: "bold",
        },
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            family: "League Spartan",
            size: 12,
            weight: "bold",
          },
          color: "white",
        },
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            family: "League Spartan",
            size: 12,
          },
          color: "white",
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="bar-chart">
      {data ? <Bar data={data} options={options} /> : <p>Loading data...</p>}
    </div>
  );
}

export default BarChart;
