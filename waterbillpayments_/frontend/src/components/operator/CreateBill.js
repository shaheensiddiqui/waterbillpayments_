import React, { useState } from "react";
import axios from "axios";
import { API_BASE } from "../../config";

function generateBillNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `WB-${year}-${random}`;
}

export default function CreateBill({ token }) {
  const [createData, setCreateData] = useState({
    bill_number: generateBillNumber(),
    consumer_name: "",
    email: "",
    address: "",
    service_period_start: "",
    service_period_end: "",
    due_date: "",
    base_amount: "",
    penalty_amount: "",
  });

  const [createMsg, setCreateMsg] = useState("");
  const [createErr, setCreateErr] = useState("");

  async function handleCreateBill(e) {
    e.preventDefault();
    setCreateErr("");
    setCreateMsg("");

    const requiredFields = [
      "bill_number",
      "consumer_name",
      "email",
      "address",
      "service_period_start",
      "service_period_end",
      "due_date",
      "base_amount",
    ];

    for (const field of requiredFields) {
      if (!createData[field] || createData[field].toString().trim() === "") {
        return setCreateErr(`"${field.replaceAll("_", " ")}" is required.`);
      }
    }

    try {
      const totalAmount =
        Number(createData.base_amount || 0) + Number(createData.penalty_amount || 0);

      await axios.post(
        `${API_BASE}/api/bills/create`,
        { ...createData, penalty_amount: createData.penalty_amount || 0, total_amount: totalAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCreateMsg("Bill created successfully!");
      setCreateData({
        bill_number: generateBillNumber(),
        consumer_name: "",
        email: "",
        address: "",
        service_period_start: "",
        service_period_end: "",
        due_date: "",
        base_amount: "",
        penalty_amount: "",
      });
    } catch (err) {
      setCreateErr(err.response?.data?.error || "Failed to create bill");
    }
  }

  return (
    <form onSubmit={handleCreateBill}>
      <h5 className="fw-bold text-primary mb-3">Create New Bill</h5>
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label fw-semibold">Bill Number</label>
          <input type="text" className="form-control" value={createData.bill_number} readOnly />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label fw-semibold">Consumer Name</label>
          <input
            type="text"
            className="form-control"
            value={createData.consumer_name}
            onChange={(e) => setCreateData({ ...createData, consumer_name: e.target.value })}
          />
        </div>
      </div>
      <div className="mb-3">
        <label className="form-label fw-semibold">Email</label>
        <input
          type="email"
          className="form-control"
          value={createData.email}
          onChange={(e) => setCreateData({ ...createData, email: e.target.value })}
        />
      </div>
      <div className="mb-3">
        <label className="form-label fw-semibold">Address</label>
        <textarea
          className="form-control"
          rows="2"
          value={createData.address}
          onChange={(e) => setCreateData({ ...createData, address: e.target.value })}
        ></textarea>
      </div>
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label fw-semibold">Service Period Start</label>
          <input
            type="date"
            className="form-control"
            value={createData.service_period_start}
            onChange={(e) => setCreateData({ ...createData, service_period_start: e.target.value })}
          />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label fw-semibold">Service Period End</label>
          <input
            type="date"
            className="form-control"
            value={createData.service_period_end}
            onChange={(e) => setCreateData({ ...createData, service_period_end: e.target.value })}
          />
        </div>
      </div>
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label fw-semibold">Due Date</label>
          <input
            type="date"
            className="form-control"
            value={createData.due_date}
            onChange={(e) => setCreateData({ ...createData, due_date: e.target.value })}
          />
        </div>
        <div className="col-md-3 mb-3">
          <label className="form-label fw-semibold">Base Amount (₹)</label>
          <input
            type="number"
            className="form-control"
            value={createData.base_amount}
            onChange={(e) => setCreateData({ ...createData, base_amount: e.target.value })}
          />
        </div>
        <div className="col-md-3 mb-3">
          <label className="form-label fw-semibold">Penalty (₹)</label>
          <input
            type="number"
            className="form-control"
            value={createData.penalty_amount}
            onChange={(e) => setCreateData({ ...createData, penalty_amount: e.target.value })}
          />
        </div>
      </div>
      {createErr && <p className="text-danger small">{createErr}</p>}
      {createMsg && <p className="text-success small">{createMsg}</p>}
      <button type="submit" className="btn btn-primary fw-bold w-100 py-2">
        Create Bill
      </button>
    </form>
  );
}
