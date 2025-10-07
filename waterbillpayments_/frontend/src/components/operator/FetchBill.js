import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE } from "../../config";
import { QRCodeCanvas } from "qrcode.react";

const statuses = ["CREATED", "LINK_SENT", "PAID", "CANCELLED"];

function BillTimeline({ currentStatus }) {
  const statuses = ["CREATED", "LINK_SENT", "PAID", "CANCELLED"];
  const activeIndex = statuses.indexOf(currentStatus);

  return (
    <div className="mt-4">
      <h6 className="fw-bold mb-3">Bill Status Timeline</h6>
      <div className="d-flex justify-content-between align-items-center position-relative" style={{ maxWidth: "600px" }}>
        {statuses.map((status, index) => {
          const isActive = index <= activeIndex;
          return (
            <div key={status} className="text-center flex-fill position-relative">
              <div
                className={`rounded-circle mx-auto ${
                  isActive ? "bg-success" : "bg-light"
                }`}
                style={{
                  width: "18px",
                  height: "18px",
                  border: "2px solid #6c757d",
                  zIndex: 2,
                }}
              ></div>
              <div
                className={`mt-2 small ${
                  isActive ? "text-success fw-semibold" : "text-muted"
                }`}
              >
                {status.replace("_", " ")}
              </div>
              {index < statuses.length - 1 && (
                <div
                  className={`position-absolute top-50 start-100 translate-middle-y ${
                    isActive ? "bg-success" : "bg-secondary"
                  }`}
                  style={{
                    height: "3px",
                    width: "100%",
                    zIndex: 1,
                  }}
                ></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


export default function FetchBill({ token }) {
  const [billNumber, setBillNumber] = useState("");
  const [bill, setBill] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState(null);
  const [linkErr, setLinkErr] = useState("");

  async function handleFetch(e) {
    e.preventDefault();
    setError("");
    setBill(null);
    setLink(null);
    setLinkErr("");
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/bills/fetch`,
        { billNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBill(res.data.bill);
    } catch (err) {
const msg =
  typeof err.response?.data?.error === "object"
    ? err.response?.data?.error?.message || JSON.stringify(err.response.data.error)
    : err.response?.data?.error || err.message || "Failed to fetch bill";
setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateLink() {
    setLinkErr("");
    setLink(null);
    try {
      const res = await axios.post(
        `${API_BASE}/api/paylinks`,
        { bill_number: bill.bill_number, channel: "link" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLink(res.data.link);
      setBill(res.data.bill);
    } catch (err) {
const msg =
  typeof err.response?.data?.error === "object"
    ? err.response?.data?.error?.message || JSON.stringify(err.response.data.error)
    : err.response?.data?.error || err.message || "Failed to create link";
setLinkErr(msg);
    }
  }

  return (
    <div>
      <form onSubmit={handleFetch} className="mb-4">
        <label className="form-label fw-semibold">Enter Bill Number</label>
        <div className="input-group">
          <input
            type="text"
            className="form-control form-control-lg fs-6"
            placeholder="e.g., WB-2025-0001"
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
      </form>

      {error && <p className="text-danger small">{error}</p>}

      {bill && (
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <h5 className="text-primary fw-bold mb-3">Bill Details</h5>
            <p><strong>Consumer Name:</strong> {bill.consumer_name}</p>
            <p><strong>Email:</strong> {bill.email}</p>
            <p><strong>Address:</strong> {bill.address}</p>
            <p><strong>Service Period:</strong> {bill.service_period_start} to {bill.service_period_end}</p>
            <p><strong>Due Date:</strong> {bill.due_date}</p>
            <p><strong>Total Amount:</strong> ₹{bill.total_amount}</p>
            <p><strong>Status:</strong> {bill.status}</p>

            <button className="btn btn-success mt-2" onClick={handleCreateLink}>
              Create Payment Link
            </button>

            {linkErr && <p className="text-danger small mt-2">{linkErr}</p>}

            {link && (
              <div className="mt-3">
                <div className="mb-2">
                  <a href={link.link_url} target="_blank" rel="noreferrer">
                    {link.link_url}
                  </a>
                </div>
                <QRCodeCanvas value={link.link_url} size={160} />
              </div>
            )}

            <button
  className="btn btn-outline-primary mt-2 ms-2"
  onClick={async () => {
    try {
      await axios.post(
  `${API_BASE}/api/bills/email/paylink`,
  { bill_number: bill.bill_number, to_email: bill.email },
  { headers: { Authorization: `Bearer ${token}` } }
);

      alert("Email sent successfully!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to send email");
    }
  }}
>
  Send Email
</button>


            {/* 🔹 Timeline added here */}
            <BillTimeline currentStatus={bill.status} />
          </div>
        </div>
      )}
    </div>
  );
}
