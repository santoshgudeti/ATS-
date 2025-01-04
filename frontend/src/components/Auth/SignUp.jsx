import React, { useState } from "react";
import axios from "axios";
import './auth.css';
const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post("http://localhost:5000/signup", { name, email, password });
      alert("Account created successfully");
    } catch (error) {
      alert(error.response?.data?.error || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card shadow-lg border-0">
        <div className="card-body p-5">
          <h2 className="text-center mb-4">Sign Up</h2>
          <form onSubmit={handleSignUp}>
            <div className="mb-3">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-person"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="mb-3">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="mb-3">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn w-100 mb-4"
              style={{
                background: "linear-gradient(to right, #36d1dc, #5b86e5)",
                color: "white"
              }}
              disabled={isLoading}
            >
              {isLoading ? "Signing Up..." : "SIGN UP"}
            </button>
            <div className="position-relative mb-4">
              <hr className="my-4" />
              <div className="position-absolute top-50 start-50 translate-middle px-3 bg-white">
                <small className="text-muted text-uppercase">Or Sign Up Using</small>
              </div>
            </div>
            <div className="d-flex justify-content-center gap-2">
              <button type="button" className="btn btn-outline-primary rounded-circle">
                <i className="bi bi-facebook"></i>
              </button>
              <button type="button" className="btn btn-outline-info rounded-circle">
                <i className="bi bi-twitter"></i>
              </button>
              <button type="button" className="btn btn-outline-danger rounded-circle">
                <i className="bi bi-google"></i>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

