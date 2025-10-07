import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import "../App.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, {
        email,
        password,
      });

      const { token, role } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("municipality_id", res.data.municipality_id);


      if (role === "SUPERADMIN") navigate("/dashboard/superadmin");
      else if (role === "ADMIN") navigate("/dashboard/admin");
      else if (role === "OPERATOR") navigate("/dashboard/operator");
      else setError("Unknown role. Please contact support.");
    } catch (err) {
      setError(
        err.response?.data?.error || "Login failed. Please check credentials."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
  <div className="d-flex justify-content-center align-items-center vh-100 bg-light-blue">
    <div className="card shadow-lg border-0" style={{ width: "600px", borderRadius: "20px" }}>
      <div className="card-body p-5">
        <h3 className="text-center mb-4 text-primary fs-3 fw-bold">MUNICIPAL WATER BILL PAYMENTS</h3>
        <h3 className="text-center mb-4 text-primary fs-5">LOGIN</h3>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label  ">Email</label>
            <input
              type="email"
              className="form-control form-control-lg fs-6"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control form-control-lg fs-6"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-danger small">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary w-100 py-2"
            style={{ borderRadius: "8px", fontWeight: "500" }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

        </form>
      </div>
    </div>
  </div>
);
}