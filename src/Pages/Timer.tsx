import Navbar from "../Components/Navbar";
import Stopwatch from "../Components/Stopwatch";

// import Dropdown from "../Components/Dropdown/Dropdown";
function Timer() {
  return (
    <div>
      <Navbar />
      <div>
        {/* <div className="dropdown-area">
          <Dropdown />
        </div> */}
        <Stopwatch />
      </div>
    </div>
  );
}

export default Timer;
