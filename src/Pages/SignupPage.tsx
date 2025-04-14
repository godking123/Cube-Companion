import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  // Determine whether it's a login or signup
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const apiUrl = process.env.REACT_APP_API_URL;
    axios
      .post(`${apiUrl}/signup`, { name, email, password })
      .then((result) => {
        console.log(result);
        if (result.data !== "Exists") {
          localStorage.setItem("signedIn", JSON.stringify(true));
          localStorage.setItem("user", JSON.stringify(result.data)); // Store user data
          navigate("/Timer"); // Redirect to Timer page after signup
        } else {
          console.log("Email Already Registered");
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="signupPage">
      {" "}
      <form id="signup-form" onSubmit={handleSubmit}>
        <div className="signup-container">
          <div className="header">
            <div className="text">Sign Up</div>
            <div className="underline"></div>
          </div>
          <div className="inputs">
            <div className="input">
              <img src="/Icons/person.png" alt="Person Icon" />
              <input
                type="text"
                placeholder="Name"
                required
                onChange={(e) => setName(e.target.value)}
              />
            </div>

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
            <button type="submit" className="submit">
              Sign Up
            </button>
            <button
              type="submit"
              className="submit gray"
              onClick={() => navigate("/LoginPage")}
            >
              Login
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default SignupPage;
