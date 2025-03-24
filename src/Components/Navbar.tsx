import "./Components.css";
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";

function Navbar() {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [user, setUser] = useState<{ level: number; solves: number } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true); // New loading state
  const isSignedIn = localStorage.getItem("signedIn");
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const updateUserFromStorage = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      console.log(user);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const handleUserUpdate = () => {
      updateUserFromStorage();
    };

    window.addEventListener("userUpdated", handleUserUpdate);
    return () => window.removeEventListener("userUpdated", handleUserUpdate);
  }, []);
  useEffect(() => {
    updateUserFromStorage();
  }, []);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "user") {
        updateUserFromStorage();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const getSolvesPerLevel = (level: number) => {
    return 20 + (level - 1) * 3;
  };

  const calculateProgress = () => {
    if (user && user.solves) {
      const solvesPerLevel = getSolvesPerLevel(user.level);
      const progress = ((user.solves % solvesPerLevel) / solvesPerLevel) * 100;
      return progress;
    }
    return 0;
  };

  if (isLoading) {
    return null;
  }

  return (
    <nav className="navbar">
      <ul className="navbar__menu">
        <img
          className="logo"
          src="/Cube_Companion__2_-removebg-preview.png"
          id="navbar__logo"
          alt="Cube Companion Logo"
        />
        <li>
          <NavLink to="/Timer" id="timerPage" className="navbar__links">
            <img className="icons" src="/Icons/TImer.png" />
            Timer
          </NavLink>
        </li>
        <li>
          <NavLink
            to={isSignedIn ? "/MySolves" : "/SignupPage"}
            className="navbar__links"
          >
            <img className="icons" src="/Icons/Solves.png" />
            My Solves
          </NavLink>
        </li>
        <li>
          <NavLink
            to={isSignedIn ? "/Statistics" : "/SignupPage"}
            className="navbar__links"
          >
            <img className="icons" src="/Icons/Statistics.png" alt="" />
            Statistics
          </NavLink>
        </li>
      </ul>

      {!isSmallScreen && !user && (
        <div className="navbar__auth">
          <NavLink to="/SignupPage" className="signup">
            Sign Up
          </NavLink>
          <NavLink to="/LoginPage" className="signup">
            Log In
          </NavLink>
        </div>
      )}

      {!isSmallScreen && isSignedIn && user && (
        <div className="acc-container">
          <div className="navbar__auth">
            <div className="acc">Level {user.level}</div>
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
