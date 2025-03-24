import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

import { ChartOptions } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

import { Time } from "./Stopwatch.tsx";

function PiChart() {
  const storedArray = localStorage.getItem("times");
  const times: Time[] = storedArray
    ? JSON.parse(storedArray).map(
        (t: { scramble: string; elapsedTime: number; type: string }) =>
          new Time(t.scramble, t.elapsedTime, t.type)
      )
    : [];

  // Count occurrences of each cube type
  const typeCounts: Record<string, number> = {};
  times.forEach((t) => {
    typeCounts[t.type] = (typeCounts[t.type] || 0) + 1;
  });

  // Convert counts to percentages
  const totalSolves = times.length;
  const labels = Object.keys(typeCounts);
  const dataValues = labels.map(
    (label) => (typeCounts[label] / totalSolves) * 100
  );

  const data = {
    labels,
    datasets: [
      {
        label: "Solve Percentage",
        data: dataValues,
        backgroundColor: [
          "rgb(255, 63, 105)", // Red
          "rgb(62, 164, 231)", // Blue
          "rgb(255, 211, 98)", // Yellow
          "rgb(79, 88, 211)", // Green
          "rgb(167, 127, 247)", // Purple
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
  };

  const options: ChartOptions<"pie"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: {
            family: "League Spartan", // Custom font
            size: 14,
            weight: "bold",
          },
          color: "white",
        },
      },
      title: {
        display: true,
        text: "Solve Percentage by Cube Type",
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
        },
        bodyFont: {
          family: "League Spartan",
          size: 12,
        },
      },
    },
    scales: {
      x: {
        display: false, // Hide x-axis
        grid: { display: false }, // Hide x-axis grid lines
      },
      y: {
        display: false, // Hide y-axis
        grid: { display: false }, // Hide y-axis grid lines
      },
    },
  };

  return (
    <div className="pi-chart">
      <Pie data={data} options={options} />
    </div>
  );
}

export default PiChart;
