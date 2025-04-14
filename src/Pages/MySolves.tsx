import { useState, useRef, useEffect } from "react";
import Navbar from "../Components/Navbar";
import { Time } from "../Components/Stopwatch";
import { PNG, PNGVisualizerOptions, Type } from "sr-puzzlegen";

const SOLVES_PER_PAGE = 10;

interface PuzzleOptionsWithSize extends PNGVisualizerOptions {
  puzzle: {
    size?: number;
    alg: string;
  };
}

function MySolves() {
  const cubeImageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedType, setSelectedType] = useState("All");
  const [sortByFastest, setSortByFastest] = useState(false);
  const user = localStorage.getItem("user");
  const storedArray = localStorage.getItem("times");
  const times: Time[] = storedArray
    ? JSON.parse(storedArray)
        .map(
          (t: { scramble: string; elapsedTime: number; type: string }) =>
            new Time(t.scramble, t.elapsedTime, t.type)
        )
        .reverse()
    : [];

  const totalPages = Math.ceil(times.length / SOLVES_PER_PAGE);

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const handleTypeFilter = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(event.target.value);
    setCurrentPage(0);
  };

  const toggleSortByFastest = () => {
    setSortByFastest((prev) => !prev);
    setCurrentPage(0);
  };

  let filteredSolves = times.filter((solve) => {
    const matchesType = selectedType === "All" || solve.type === selectedType;
    return matchesType;
  });

  if (sortByFastest) {
    filteredSolves = [...filteredSolves].sort(
      (a, b) => a.elapsedTime - b.elapsedTime
    );
  }

  const paginatedSolves = filteredSolves.slice(
    currentPage * SOLVES_PER_PAGE,
    (currentPage + 1) * SOLVES_PER_PAGE
  );

  const deleteSolve = (index: number) => {
    // Remove the solve from the times array
    const updatedTimes = [...times];
    updatedTimes.splice(index, 1);

    // Update the local storage
    localStorage.setItem("times", JSON.stringify(updatedTimes));

    // Force the component to re-render
    window.location.reload();
  };

  const renderCubeImage = (type: string, scramble: string, index: number) => {
    if (!cubeImageRefs.current[index]) return;
    cubeImageRefs.current[index]!.innerHTML = "";

    const newOptions: PuzzleOptionsWithSize = {
      width: 220,
      height: 220,
      puzzle: { alg: scramble },
    };

    if (["2x2", "4x4", "5x5", "6x6", "7x7"].includes(type)) {
      newOptions.puzzle.size = parseInt(type[0]);
    }

    const typeMapping: Record<string, Type> = {
      "3x3": Type.CUBE,
      "2x2": Type.CUBE,
      "4x4": Type.CUBE,
      "5x5": Type.CUBE,
      "6x6": Type.CUBE,
      "7x7": Type.CUBE,
      Megaminx: Type.MEGAMINX,
      Pyraminx: Type.PYRAMINX,
      Skewb: Type.SKEWB,
      Square1: Type.SQUARE1,
    };

    // Use requestAnimationFrame to smooth the image rendering
    requestAnimationFrame(() =>
      PNG(cubeImageRefs.current[index]!, typeMapping[type], newOptions)
    );
  };

  // UseEffect hook to handle image rendering only when paginatedSolves change
  useEffect(() => {
    cubeImageRefs.current.forEach((ref) => {
      if (ref) ref.innerHTML = "";
    });

    paginatedSolves.forEach((solve, index) => {
      renderCubeImage(solve.type, solve.scramble, index);
    });
  }, [paginatedSolves]);

  return (
    <div>
      <Navbar />
      <div className="filters">
        <select
          onChange={handleTypeFilter}
          value={selectedType}
          className="filter-item"
        >
          <option value="All">All Types</option>
          <option value="3x3">3x3</option>
          <option value="2x2">2x2</option>
          <option value="4x4">4x4</option>
          <option value="5x5">5x5</option>
          <option value="6x6">6x6</option>
          <option value="7x7">7x7</option>
          <option value="Megaminx">Megaminx</option>
          <option value="Pyraminx">Pyraminx</option>
          <option value="Skewb">Skewb</option>
          <option value="Square1">Square1</option>
        </select>

        <button className="filter-item" onClick={toggleSortByFastest}>
          {sortByFastest ? "Sort by Latest" : "Sort by Fastest"}
        </button>
      </div>

      {user && (
        <div className="solves-container">
          {paginatedSolves.length === 0 ? (
            <p className="no-solves">No solves available</p>
          ) : (
            paginatedSolves.map((solve, index) => (
              <div key={index} className="solve-card">
                <div className="solveStats">
                  <p className="solve-time">{solve.formattedTime}</p>
                  <p>
                    <strong>Type:</strong> {solve.type}
                  </p>
                  <p>
                    <strong>Date:</strong> {new Date().toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => deleteSolve(index)}
                    className="delete-button"
                  >
                    Delete Solve
                  </button>
                </div>
                <div
                  id="imageSolve"
                  ref={(el) => (cubeImageRefs.current[index] = el)}
                ></div>
              </div>
            ))
          )}
          {totalPages > 1 && (
            <div className="pagination-controls">
              <button onClick={handlePrevPage} disabled={currentPage === 0}>
                Prev
              </button>
              <span>
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MySolves;
