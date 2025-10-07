import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { API_BASE } from "../config";

export default function SuperAdminDashboard() {
  const [municipalities, setMunicipalities] = useState([]);
  const [name, setName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [selectedMunicipality, setSelectedMunicipality] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [adminSuccess, setAdminSuccess] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [users, setUsers] = useState([]);
  const [userError, setUserError] = useState("");
  const [userLoading, setUserLoading] = useState(false);



  const token = localStorage.getItem("token");

  // Fetch municipalities
  const fetchMunicipalities = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE}/api/municipalities`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMunicipalities(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load municipalities");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchUsers = useCallback(async () => {
  setUserLoading(true);
  setUserError("");
  try {
    const res = await axios.get(`${API_BASE}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(res.data.filter((u) => u.role !== "SUPERADMIN"));
  } catch (err) {
    setUserError(err.response?.data?.error || "Failed to load users");
  } finally {
    setUserLoading(false);
  }
}, [token]);


  useEffect(() => {
    fetchMunicipalities();
  }, [fetchMunicipalities]);

  useEffect(() => {
  fetchUsers();
}, [fetchUsers]);


  // Create Municipality
  const handleCreateMunicipality = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!name.trim()) return setError("Municipality name is required");

    try {
      await axios.post(
        `${API_BASE}/api/municipalities`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Municipality created successfully!");
      setName("");
      fetchMunicipalities();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create municipality");
    }
  };

  // Create Admin under Municipality
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setAdminError("");
    setAdminSuccess("");

    // for validation
    if (!selectedMunicipality)
      return setAdminError("Please select a municipality first.");
    if (!adminName.trim() || !adminEmail.trim())
      return setAdminError("Both name and email are required.");
    if (adminPassword.length < 6)
      return setAdminError("Password must be at least 6 characters long.");


    try {
      const res = await axios.post(
  `${API_BASE}/api/auth/register`,
  {
    name: adminName,
    email: adminEmail,
    password: adminPassword,// default password
    role: "ADMIN",
    municipality_id: selectedMunicipality,
  },
  { headers: { Authorization: `Bearer ${token}` } }
);
console.log("Admin created:", res.data);


      setAdminSuccess("Admin created successfully!");
      setAdminName("");
      setAdminEmail("");
      setSelectedMunicipality("");
    } catch (err) {
      setAdminError(err.response?.data?.error || "Failed to create admin");
    }
  };

  return (
    <>
        

    <div className="container-fluid bg-light-blue min-vh-100 py-5">
      <div className="container">
        <div
          className="card shadow-lg border-0 mx-auto"
          style={{ maxWidth: "850px", borderRadius: "20px" }}
        >
          <div className="card-body p-5">
            <h3 className="text-center mb-4 text-primary fw-bold">
              SuperAdmin Dashboard
            </h3>
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

            {/* Municipality Creation Section */}
            <form onSubmit={handleCreateMunicipality} className="mb-5">
              <h5 className="fw-bold text-primary mb-3">Add Municipality</h5>
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Municipality Name
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg fs-6"
                  placeholder="Enter municipality name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              {error && <p className="text-danger small">{error}</p>}
              {success && <p className="text-success small">{success}</p>}

              <button
                type="submit"
                className="btn btn-primary w-100 fw-bold py-2"
              >
                Create Municipality
              </button>
            </form>

            <hr />

            {/* Admin Creation Section */}
            <div className="mt-5">
              <h5 className="fw-bold text-primary mb-3">Add Admin</h5>

              {municipalities.length === 0 ? (
                <div className="alert alert-warning fw-semibold" role="alert">
                  Please create a municipality before adding admins.
                </div>
              ) : (
                <form onSubmit={handleCreateAdmin}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Select Municipality
                    </label>
                    <select
                      className="form-select form-select-lg fs-6"
                      value={selectedMunicipality}
                      onChange={(e) => setSelectedMunicipality(e.target.value)}
                    >
                      <option value="">Select Municipality</option>
                      {municipalities.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Admin Name</label>
                    <input
                      type="text"
                      className="form-control form-control-lg fs-6"
                      placeholder="Enter admin name"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Admin Email</label>
                    <input
                      type="email"
                      className="form-control form-control-lg fs-6"
                      placeholder="Enter admin email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Admin Password</label>
                    <input
                        type="password"
                        className="form-control form-control-lg fs-6"
                        placeholder="Enter password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                    />
                    </div>


                  {adminError && <p className="text-danger small">{adminError}</p>}
                  {adminSuccess && <p className="text-success small">{adminSuccess}</p>}

                  <button
                    type="submit"
                    className="btn btn-primary w-100 fw-bold py-2"
                  >
                    Create Admin
                  </button>
                </form>
              )}
            </div>

            <hr />

            {/* List Municipalities */}
            <h5 className="fw-bold text-primary mt-5 mb-3">
              Existing Municipalities
            </h5>
            {loading ? (
              <p>Loading...</p>
            ) : municipalities.length > 0 ? (
              <ul className="list-group">
                {municipalities.map((m) => (
                  <li
                    key={m.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <span className="fw-semibold">{m.name}</span>
                    <span className="badge bg-success rounded-pill">Active</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">No municipalities found.</p>
            )}
            <hr />
<h5 className="fw-bold text-primary mt-5 mb-3">
  Existing Users
</h5>

{userLoading ? (
  <p>Loading...</p>
) : userError ? (
  <p className="text-danger">{userError}</p>
) : users.length > 0 ? (
  <ul className="list-group">
    {users.map((u) => (
      <li
        key={u.id}
        className="list-group-item d-flex justify-content-between align-items-center"
      >
        <span className="fw-semibold">{u.email}</span>
        <span className="badge bg-secondary rounded-pill">{u.role}</span>
      </li>
    ))}
  </ul>
) : (
  <p className="text-muted">No users found.</p>
)}

          </div>
        </div>
      </div>
    </div>
    </>
  );
}
