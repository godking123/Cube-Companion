import { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);

import { Time } from "./Stopwatch.tsx";

function LineChart() {
  const storedArray = localStorage.getItem("times");
  const times: Time[] = storedArray
    ? JSON.parse(storedArray).map(
        (t: { scramble: string; elapsedTime: number; type: string }) =>
          new Time(t.scramble, t.elapsedTime, t.type),
      )
    : [];

  // Get unique cube types
  const cubeTypes = Array.from(new Set(times.map((t) => t.type)));

  // State to track selected cube type
  const [selectedType, setSelectedType] = useState(cubeTypes[0] || "");

  // Filter times based on selected type
  const filteredTimes = times.filter((t) => t.type === selectedType);

  const data = {
    labels: filteredTimes.map((_, index) => `${index + 1}`),
    datasets: [
      {
        label: `Solve Times (${selectedType})`,
        data: filteredTimes.map((t) => t.elapsedTime / 1000), // Convert ms to seconds
        fill: false,
        borderColor: "rgb(202, 182, 255)",
        tension: 0.1,
        pointRadius: 0, // Removed dots
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false, // Allow manual sizing
    plugins: {
      legend: {
        display: true,
        labels: {
          font: {
            family: "League Spartan",
            size: 14,
          },
          color: "white",
        },
      },
      tooltip: {
        titleFont: {
          family: "League Spartan",
          size: 14,
        },
        bodyFont: {
          family: "League Spartan",
          size: 12,
        },
      },
    },
    elements: {
      line: {
        borderColor: "rgb(202, 182, 255)",
        borderWidth: 2,
      },
    },
    scales: {
      x: {
        ticks: {
          display: filteredTimes.length < 50,
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
      y: {
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
    <div className="line-chart-container">
      <select
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value)}
        className="stat-dropdown"
      >
        {cubeTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>

      {filteredTimes.length > 0 ? (
        <div className="chart-wrapper">
          <Line options={options} data={data} />
        </div>
      ) : (
        <p>No solves recorded for this cube type.</p>
      )}
    </div>
  );
}

export default LineChart;
