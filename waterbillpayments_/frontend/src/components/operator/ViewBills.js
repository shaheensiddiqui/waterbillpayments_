import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../config";
import { toast } from "react-toastify";

export default function ViewBills() {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  async function loadBills() {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE}/api/bills/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBills(res.data);
      setFilteredBills(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load bills");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBills();
  }, []);

  // 🔍 Combined filter: search + status
  useEffect(() => {
    const q = search.toLowerCase();
    let filtered = bills.filter(
      (b) =>
        b.bill_number.toLowerCase().includes(q) ||
        b.consumer_name.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q)
    );

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    setFilteredBills(filtered);
  }, [search, statusFilter, bills]);

  async function handleResendLink(bill_number, email) {
    try {
      await axios.post(
        `${API_BASE}/api/bills/email/paylink`,
        { bill_number, to_email: email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Payment link resent to ${email}`);
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Failed to resend payment link"
      );
    }
  }

  return (
    <div className="container py-5">
      <h3 className="text-primary fw-bold mb-4">All Bills</h3>

      {/* 🔍 Search + Filter Row */}
      <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
        <div className="input-group" style={{ maxWidth: "400px" }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by bill number, name, or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="btn btn-outline-secondary"
            onClick={() => setSearch("")}
          >
            Clear
          </button>
        </div>

        <select
          className="form-select"
          style={{ maxWidth: "200px" }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="CREATED">Created</option>
          <option value="LINK_SENT">Link Sent</option>
          <option value="PAID">Paid</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && filteredBills.length === 0 && <p>No bills found.</p>}

      {filteredBills.length > 0 && (
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead className="table-primary">
              <tr>
                <th>Bill Number</th>
                <th>Consumer Name</th>
                <th>Email</th>
                <th>Total Amount (₹)</th>
                <th>Status</th>
                <th>Created On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.map((bill) => (
                <tr key={bill.id}>
                  <td>{bill.bill_number}</td>
                  <td>{bill.consumer_name}</td>
                  <td>{bill.email}</td>
                  <td>{bill.total_amount}</td>
                  <td>
                    <span
                      className={`badge ${
                        bill.status === "PAID"
                          ? "bg-success"
                          : bill.status === "LINK_SENT"
                          ? "bg-warning text-dark"
                          : bill.status === "CREATED"
                          ? "bg-secondary"
                          : "bg-danger"
                      }`}
                    >
                      {bill.status}
                    </span>
                  </td>
                  <td>{new Date(bill.createdAt).toLocaleDateString()}</td>
                  <td>
                    {(bill.status === "LINK_SENT" ||
                      bill.status === "CREATED") && (
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() =>
                          handleResendLink(bill.bill_number, bill.email)
                        }
                      >
                        Resend Link
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
