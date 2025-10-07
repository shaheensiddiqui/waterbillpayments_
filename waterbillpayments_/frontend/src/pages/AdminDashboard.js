import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { API_BASE } from "../config";

export default function AdminDashboard() {
  const [operators, setOperators] = useState([]);
  const [operatorName, setOperatorName] = useState("");
  const [operatorEmail, setOperatorEmail] = useState("");
  const [operatorPassword, setOperatorPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  // Fetch operators for this admin
  const fetchOperators = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE}/api/users/operators`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const filtered = res.data.filter((u) => u.role === "OPERATOR");
      setOperators(filtered);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load operators");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOperators();
  }, [fetchOperators]);

  // Create Operator
  const handleCreateOperator = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!operatorName.trim() || !operatorEmail.trim())
      return setError("Name and email are required");
    if (operatorPassword.length < 6)
      return setError("Password must be at least 6 characters long");

    try {
      const res = await axios.post(
        `${API_BASE}/api/auth/register`,
        {
          name: operatorName,
          email: operatorEmail,
          password: operatorPassword,
          role: "OPERATOR",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Operator created:", res.data);

      setSuccess("Operator created successfully!");
      setOperatorName("");
      setOperatorEmail("");
      setOperatorPassword("");
      fetchOperators();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create operator");
    }
  };

  return (
    <div className="container-fluid bg-light-blue min-vh-100 py-5">
      <div className="container">
        <div
          className="card shadow-lg border-0 mx-auto"
          style={{ maxWidth: "850px", borderRadius: "20px" }}
        >
          <div className="card-body p-5">
            <div className="d-flex justify-content-end mb-3">
              <button
                className="btn btn-outline-danger fw-semibold"
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/";
                }}
              >
                Logout
              </button>
            </div>

            <h3 className="text-center mb-4 text-primary fw-bold">
              Admin Dashboard
            </h3>

            {/* Operator Creation Section */}
            <form onSubmit={handleCreateOperator} className="mb-5">
              <h5 className="fw-bold text-primary mb-3">Add Operator</h5>

              <div className="mb-3">
                <label className="form-label fw-semibold">Operator Name</label>
                <input
                  type="text"
                  className="form-control form-control-lg fs-6"
                  placeholder="Enter operator name"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Operator Email</label>
                <input
                  type="email"
                  className="form-control form-control-lg fs-6"
                  placeholder="Enter operator email"
                  value={operatorEmail}
                  onChange={(e) => setOperatorEmail(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Operator Password
                </label>
                <input
                  type="password"
                  className="form-control form-control-lg fs-6"
                  placeholder="Enter password"
                  value={operatorPassword}
                  onChange={(e) => setOperatorPassword(e.target.value)}
                />
              </div>

              {error && <p className="text-danger small">{error}</p>}
              {success && <p className="text-success small">{success}</p>}

              <button
                type="submit"
                className="btn btn-primary w-100 fw-bold py-2"
              >
                Create Operator
              </button>
            </form>

            <hr />

            {/* Existing Operators */}
            <h5 className="fw-bold text-primary mt-5 mb-3">
              Existing Operators
            </h5>
            {loading ? (
              <p>Loading...</p>
            ) : operators.length > 0 ? (
              <ul className="list-group">
                {operators.map((op) => (
                  <li
                    key={op.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <span className="fw-semibold">{op.name}</span>
                    <span className="text-muted">{op.email}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">No operators found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
