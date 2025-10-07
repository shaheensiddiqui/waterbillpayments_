import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../config";

export default function Transactions({ token }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState({
    today: 0,
    week: 0,
    total: 0,
    failed: 0,
  });

  useEffect(() => {
    async function fetchTxns() {
      try {
        const res = await axios.get(`${API_BASE}/api/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data || [];
        setTransactions(data);

        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
        startOfWeek.setHours(0, 0, 0, 0);

        let today = 0,
          week = 0,
          total = 0,
          failed = 0;

        data.forEach((txn) => {
          const paidAt = new Date(txn.createdAt);
          if (txn.status === "SUCCESS" || txn.status === "PAID") total++;
          if (txn.status === "FAILED") failed++;

          if (paidAt.toDateString() === now.toDateString()) today++;
          if (paidAt >= startOfWeek) week++;
        });

        setSummary({ today, week, total, failed });
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    }
    fetchTxns();
  }, [token]);

  if (loading) return <p>Loading transactions...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div>
      <h5 className="fw-bold text-primary mb-3">Transactions Dashboard</h5>

      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card bg-success text-white text-center shadow-sm border-0">
            <div className="card-body">
              <h6>Paid Today</h6>
              <h3>{summary.today}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-info text-white text-center shadow-sm border-0">
            <div className="card-body">
              <h6>Paid This Week</h6>
              <h3>{summary.week}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-primary text-white text-center shadow-sm border-0">
            <div className="card-body">
              <h6>Total Paid</h6>
              <h3>{summary.total}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-danger text-white text-center shadow-sm border-0">
            <div className="card-body">
              <h6>Failed Payments</h6>
              <h3>{summary.failed}</h3>
            </div>
          </div>
        </div>
      </div>

      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Bill Number</th>
                <th>Amount (₹)</th>
                <th>Status</th>
                <th>Mode</th>
                <th>Payment ID</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn, i) => (
                <tr key={txn.id}>
                  <td>{i + 1}</td>
                  <td>{txn.bill_number || txn.Bill?.bill_number || "—"}</td>
                  <td>{txn.amount}</td>
                  <td>
                    <span
                      className={`badge ${
                        txn.status === "SUCCESS" || txn.status === "PAID"
                          ? "bg-success"
                          : txn.status === "FAILED"
                          ? "bg-danger"
                          : "bg-secondary"
                      }`}
                    >
                      {txn.status}
                    </span>
                  </td>
                  <td>{txn.mode || "—"}</td>
                  <td>{txn.cf_payment_id}</td>
                  <td>{new Date(txn.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
