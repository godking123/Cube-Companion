import { useState, useEffect } from "react";
import Navbar from "../Components/Navbar";
import LineChart from "../Components/LineChart.tsx";
import PiChart from "../Components/PiChart.tsx";
import BarChart from "../Components/BarChart.tsx";
import { Time } from "../Components/Stopwatch.tsx";

export const Statistics = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const storedArray = localStorage.getItem("times");
  const times: Time[] = storedArray
    ? JSON.parse(storedArray).map(
        (t: { scramble: string; elapsedTime: number; type: string }) =>
          new Time(t.scramble, t.elapsedTime, t.type),
      )
    : [];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <Navbar />
      {times && times.length > 0 ? (
        <div className="statistics-page">
          <div className="charts-container">
            <div className="chart-wrapper">
              <div className="bar-chart">{isLoaded && <BarChart />}</div>
            </div>
            <div className="chart-wrapper">
              <div className="line-chart">{isLoaded && <LineChart />}</div>
            </div>
            <div className="chart-wrapper">
              <div className="pi-chart">{isLoaded && <PiChart />}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-message">
          <h2>No data available. Solve some cubes to see statistics!</h2>
        </div>
      )}
    </div>
  );
};
