import Timer from "./Pages/Timer";
import MySolves from "./Pages/MySolves";
import { Statistics } from "./Pages/Statistics";
import SignupPage from "./Pages/SignupPage";
import LoginPage from "./Pages/LoginPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Timer />} />
        <Route path="/Timer" element={<Timer />} />
        <Route path="/MySolves" element={<MySolves />} />
        <Route path="/Statistics" element={<Statistics />}></Route>
        <Route path="/SignupPage" element={<SignupPage />} />
        <Route path="/LoginPage" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
