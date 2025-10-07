import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../config";

export default function ViewBills() {
  const [bills, setBills] = useState([]);
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
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load bills");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBills();
  }, []);

  return (
    <div className="container py-5">
      <h3 className="text-primary fw-bold mb-4">All Bills</h3>

      {loading && <p>Loading...</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && bills.length === 0 && <p>No bills found.</p>}

      {bills.length > 0 && (
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
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => (
                <tr key={bill.id}>
                  <td>{bill.bill_number}</td>
                  <td>{bill.consumer_name}</td>
                  <td>{bill.email}</td>
                  <td>{bill.total_amount}</td>
                  <td>{bill.status}</td>
                  <td>{new Date(bill.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
