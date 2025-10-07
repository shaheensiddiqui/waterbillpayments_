import React, { useState } from "react";
import axios from "axios";
import { API_BASE } from "../../config";

export default function FetchBill({ token }) {
  const [billNumber, setBillNumber] = useState("");
  const [bill, setBill] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleFetchBill(e) {
    e.preventDefault();
    setError("");
    setBill(null);
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/bills/fetch`,
        { billNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBill(res.data.bill);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch bill");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleFetchBill} className="mb-5">
        <h5 className="fw-bold text-primary mb-3">Fetch Bill</h5>
        <div className="input-group">
          <input
            type="text"
            className="form-control form-control-lg fs-6"
            placeholder="Enter bill number (e.g. WB-2025-0003)"
            value={billNumber}
            onChange={(e) => setBillNumber(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary fw-bold px-4"
            disabled={loading}
          >
            {loading ? "Fetching..." : "Fetch"}
          </button>
        </div>
        {error && <p className="text-danger small mt-2">{error}</p>}
      </form>

      {bill && (
        <div className="card mt-4 shadow-sm border-0">
          <div className="card-body">
            <h5 className="text-primary fw-bold mb-3">Bill Details</h5>
            <p><strong>Consumer Name:</strong> {bill.consumer_name}</p>
            <p><strong>Email:</strong> {bill.email}</p>
            <p><strong>Address:</strong> {bill.address}</p>
            <p><strong>Service Period:</strong> {bill.service_period_start} to {bill.service_period_end}</p>
            <p><strong>Due Date:</strong> {bill.due_date}</p>
            <p><strong>Total Amount:</strong> ₹{bill.total_amount}</p>
            <p><strong>Status:</strong> {bill.status}</p>
          </div>
        </div>
      )}
    </>
  );
}
