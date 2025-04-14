/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { PNG, PNGVisualizerOptions, Type } from "sr-puzzlegen";
import * as Scrambler from "sr-scrambler";
import axios from "axios";

interface PuzzleOptionsWithSize extends PNGVisualizerOptions {
  puzzle: {
    size?: number;
    alg: string;
  };
}

export class Time {
  scramble: string;
  elapsedTime: number;
  formattedTime: string;
  type: string;

  constructor(scramble: string, elapsedTime: number, type: string) {
    this.scramble = scramble;
    this.elapsedTime = elapsedTime;
    this.formattedTime = Time.formatTime(elapsedTime);
    this.type = type;
  }

  static formatTime(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const hundredths = Math.floor((ms % 1000) / 10);
    return minutes > 0
      ? `${minutes}:${String(seconds).padStart(2, "0")}.${String(
          hundredths
        ).padStart(2, "0")}`
      : `${seconds}.${String(hundredths).padStart(2, "0")}`;
  }
}

const cubeTypes = [
  { label: "3x3", value: "3x3" },
  { label: "2x2", value: "2x2" },
  { label: "Megaminx", value: "Megaminx" },
  { label: "Pyraminx", value: "Pyraminx" },
  { label: "Skewb", value: "Skewb" },
  { label: "Square1", value: "Square1" },
  { label: "4x4", value: "4x4" },
  { label: "5x5", value: "5x5" },
  { label: "6x6", value: "6x6" },
  { label: "7x7", value: "7x7" },
];

function CubeDropdown({
  onCubeTypeChange,
}: {
  onCubeTypeChange: (type: string) => void;
}) {
  return (
    <select
      className="cube-dropdown"
      onChange={(e) => onCubeTypeChange(e.target.value)}
    >
      {cubeTypes.map((cube) => (
        <option key={cube.value} value={cube.value}>
          {cube.label}
        </option>
      ))}
    </select>
  );
}

function Stopwatch() {
  const stopwatchRef = useRef<HTMLHeadingElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRunningRef = useRef(false);
  const startTimeRef = useRef(0);
  const elapsedTimeRef = useRef(0);
  const isArmed = useRef(false);

  const [times, setTimes] = useState<Time[]>(() => {
    const storedArray = localStorage.getItem("times");
    return storedArray
      ? JSON.parse(storedArray).map(
          (t: { scramble: string; elapsedTime: number; type: string }) =>
            new Time(t.scramble, t.elapsedTime, t.type)
        )
      : [];
  });
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user") || "{}");
  });
  const [scramble, setScramble] = useState(String(Scrambler.cube()));

  const [type, setType] = useState(cubeTypes[0].value);

  const options: PuzzleOptionsWithSize = {
    width: 275,
    height: 275,
    puzzle: {
      alg: scramble,
      size: 3,
    },
  };

  const cubeImageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    localStorage.setItem("times", JSON.stringify(times));
  }, [times]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        isArmed.current = true;
        if (stopwatchRef.current)
          stopwatchRef.current.style.color = "rgb(202, 182, 255)";
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space" && isArmed.current) {
        event.preventDefault();
        isArmed.current = false;
        if (stopwatchRef.current) stopwatchRef.current.style.color = "white";
        timerClick();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  });

  const handleSolveCompletion = async (elapsedTime: number) => {
    const apiUrl = process.env.REACT_APP_API_URL;
    if (!user.email) return;

    try {
      const response = await axios.post(`${apiUrl}/updateSolves`, {
        email: user.email,
        elapsedTime,
      });

      const updatedUser = {
        ...user,
        level: response.data.level,
        solves: response.data.solves,
      };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.error("Error updating solves:", err);
    }
  };

  const addTimes = (elapsedTime: number, type: string) => {
    setTimes((prevTimes) => {
      const newTime = new Time(scramble, elapsedTime, type);
      setScramble(generateScramble());
      return [...prevTimes, newTime];
    });

    handleSolveCompletion(elapsedTime);
  };

  const getPB = () =>
    times.length
      ? Time.formatTime(Math.min(...times.map((t) => t.elapsedTime)))
      : "-";

  const getAvg = () =>
    times.length > 0
      ? Time.formatTime(
          times.reduce((sum, t) => sum + t.elapsedTime, 0) / times.length
        )
      : "-";

  const getAvgOfN = (n: number) => {
    if (times.length >= n) {
      const slice = times.slice(-n).map((t) => t.elapsedTime);
      return Time.formatTime(slice.reduce((sum, t) => sum + t, 0) / n);
    }
    return "-";
  };

  const getWorst = () =>
    times.length
      ? Time.formatTime(Math.max(...times.map((t) => t.elapsedTime)))
      : "-";

  function clearTimes() {
    if (!isRunningRef.current) {
      setTimes([]);
      if (stopwatchRef.current) stopwatchRef.current.textContent = "0.00";
      localStorage.removeItem("times");
    }
  }

  const timerClick = () => {
    if (!stopwatchRef.current) return;

    if (!isRunningRef.current) {
      stopwatchRef.current.textContent = "0.00";
      startTimeRef.current = Date.now() - elapsedTimeRef.current;
      timerRef.current = setInterval(update, 10);
      isRunningRef.current = true;
    } else {
      const finalElapsedTime = elapsedTimeRef.current;
      stopwatchRef.current.textContent = Time.formatTime(finalElapsedTime);
      addTimes(finalElapsedTime, type);
      if (timerRef.current) clearInterval(timerRef.current);
      isRunningRef.current = false;
      elapsedTimeRef.current = 0;
    }
  };

  const update = () => {
    elapsedTimeRef.current = Date.now() - startTimeRef.current;
    if (stopwatchRef.current) {
      stopwatchRef.current.textContent = Time.formatTime(
        elapsedTimeRef.current
      );
    }
  };

  const generateScramble = () => {
    if (type === "3x3") {
      return Scrambler.cube(3, Math.random() * (22 - 18 + 1) + 18);
    } else if (type === "Megaminx") {
      return Scrambler.megaminx();
    } else if (type === "2x2") {
      return Scrambler.cube(2, Math.random() * (12 - 9 + 1) + 9);
    } else if (type === "Pyraminx") {
      return Scrambler.pyraminx(9);
    } else if (type === "Skewb") {
      return Scrambler.skewb(9);
    } else if (type === "Square1") {
      return Scrambler.square1();
    } else if (type === "4x4") {
      return Scrambler.cube(4, 40);
    } else if (type === "5x5") {
      return Scrambler.cube(5, 60);
    } else if (type === "6x6") {
      return Scrambler.cube(6, 80);
    } else if (type === "7x7") {
      return Scrambler.cube(7, 100);
    }
    return "";
  };

  useEffect(() => {
    setScramble(generateScramble());
  }, [type]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (cubeImageRef.current) {
        cubeImageRef.current.innerHTML = "";
        if (type == "3x3") {
          PNG(cubeImageRef.current, Type.CUBE_NET, options);
        } else if (type == "Megaminx") {
          const newOptions: PuzzleOptionsWithSize = {
            width: 250,
            height: 250,
            puzzle: {
              alg: scramble,
            },
          };
          PNG(cubeImageRef.current, Type.MEGAMINX_NET, newOptions);
        } else if (type == "2x2") {
          const newOptions: PuzzleOptionsWithSize = {
            width: 250,
            height: 250,
            puzzle: {
              size: 2,
              alg: scramble,
            },
          };
          PNG(cubeImageRef.current, Type.CUBE_NET, newOptions);
        } else if (type == "Pyraminx") {
          PNG(cubeImageRef.current, Type.PYRAMINX_NET, options);
        } else if (type == "Skewb") {
          PNG(cubeImageRef.current, Type.SKEWB_NET, options);
        } else if (type == "Square1") {
          PNG(cubeImageRef.current, Type.SQUARE1, {
            width: 250,
            height: 250,
            puzzle: {
              alg: scramble,
            },
          });
        } else if (type == "4x4") {
          const newOptions: PuzzleOptionsWithSize = {
            width: 250,
            height: 250,
            puzzle: {
              size: 4,
              alg: scramble,
            },
          };
          PNG(cubeImageRef.current, Type.CUBE_NET, newOptions);
        } else if (type == "5x5") {
          const newOptions: PuzzleOptionsWithSize = {
            width: 250,
            height: 250,
            puzzle: {
              size: 5,
              alg: scramble,
            },
          };
          PNG(cubeImageRef.current, Type.CUBE_NET, newOptions);
        } else if (type == "6x6") {
          const newOptions: PuzzleOptionsWithSize = {
            width: 250,
            height: 250,
            puzzle: {
              size: 6,
              alg: scramble,
            },
          };
          PNG(cubeImageRef.current, Type.CUBE_NET, newOptions);
        } else if (type == "7x7") {
          const newOptions: PuzzleOptionsWithSize = {
            width: 250,
            height: 250,
            puzzle: {
              size: 7,
              alg: scramble,
            },
          };
          PNG(cubeImageRef.current, Type.CUBE_NET, newOptions);
        }
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [scramble, type]);

  const handleCubeTypeChange = (userType: string) => {
    setType(userType);
  };

  return (
    <div className="stopwatchContainer">
      <div id="scrambleDiv">
        <h1 id="scramble">{scramble}</h1>
      </div>

      <div id="parent-container-timer">
        <h1 id="stopwatch" ref={stopwatchRef}>
          0.00
        </h1>
      </div>
      <div className="averages">
        <button id="clearButton" onClick={clearTimes}>
          Clear Times
        </button>

        <CubeDropdown onCubeTypeChange={handleCubeTypeChange} />
      </div>
      <div id="solveContainer">
        <div className="solvesDisplay" ref={cubeImageRef}></div>
        <div className="statContainer">
          <div className="worstContainer">
            <div id="pb">
              pb <h1 className="stat">{getPB()}</h1>
            </div>
            <div className="smallStat" id="ao12">
              ao12 <h1 className="stat">{getAvgOfN(12)}</h1>
            </div>
          </div>
          <div className="worstContainer">
            <div className="smallStat" id="worst">
              worst <h1 className="stat">{getWorst()}</h1>
            </div>
            <div className="smallStat" id="avg">
              avg <h1 className="stat">{getAvg()}</h1>
            </div>
            <div className="smallStat" id="ao5">
              ao5 <h1 className="stat">{getAvgOfN(5)}</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stopwatch;
