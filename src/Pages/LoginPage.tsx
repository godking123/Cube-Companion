import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const apiUrl = process.env.REACT_APP_API_URL;
    axios
      .post(`${apiUrl}/login`, { email, password })
      .then((result) => {
        console.log(result.data); // Check the actual response
        if (result.data.success) {
          localStorage.setItem("signedIn", JSON.stringify(true));
          localStorage.setItem("user", JSON.stringify(result.data.user)); // Store user object
          navigate("/Timer");
        } else {
          console.log(result.data.message); // Log error messages
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="loginPage">
      <form id="signup-form" onSubmit={handleSubmit}>
        <div className="signup-container">
          <div className="header">
            <div className="text">Log In</div>
            <div className="underline"></div>
          </div>
          <div className="inputs">
            <div className="input">
              <img src="/Icons/email.png" alt="Email Icon" />
              <input
                type="email"
                placeholder="Email"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input">
              <img src="/Icons/password.png" alt="Password Icon" />
              <input
                type="password"
                placeholder="Password"
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="submit-container">
            <button
              className="submit gray"
              onClick={() => navigate("/SignupPage")}
            >
              Sign Up
            </button>
            <button type="submit" className="submit">
              Login
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
