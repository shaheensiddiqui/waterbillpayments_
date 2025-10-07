const axios = require("axios");
const Bill = require("../models/Bill");
const { validateBillInput } = require("../utils/validateBillInput");


exports.fetchBillFromMockBank = async (req, res) => {
  try {
    // Accept either camelCase or snake_case payloads
    const { billNumber, bill_number } = req.body || {};
    const billNum = (billNumber || bill_number || "").trim();

    if (!billNum) {
      return res.status(400).json({ error: "Bill number is required" });
    }

    const user = req.user; // operator/admin info from JWT
    const base = process.env.MOCK_BANK_URL || "http://localhost:5001";
    const url = `${base}/mock-bank/bills/${encodeURIComponent(billNum)}`;

    // Call mock-bank
    const mockRes = await axios.get(url);
    const data = mockRes.data;
    console.log("🔥 MockBank returned status:", data.status);

    // Upsert into our DB (only create if not present)
    let bill = await Bill.findOne({ where: { bill_number: data.bill_number } });
    if (!bill) {
  bill = await Bill.create({
    bill_number: data.bill_number,
    consumer_name: data.consumer_name,
    email: data.email,
    address: data.address,
    service_period_start: data.service_period_start,
    service_period_end: data.service_period_end,
    due_date: data.due_date,
    base_amount: data.base_amount,
    penalty_amount: data.penalty_amount,
    total_amount: data.total_amount,
    status: (() => {
      const s = (data.status || "").trim().toUpperCase();
      const allowed = [
        "CREATED",
        "PAID",
        "EXPIRED",
        "CANCELLED",
        "LINK_SENT",
        "PAYMENT_PENDING",
        "UNPAID"
      ];
      return allowed.includes(s) ? s : "CREATED";
    })(),
    bank_ref: data.bank_ref,
    created_by: user?.id || null,
    municipality_id: user?.municipality_id || null,
  });
}


    return res.json({ message: "Bill fetched successfully", bill });
  } catch (err) {
    // Handle known mock-bank errors cleanly
    if (err.response) {
      if (err.response.status === 404) {
        return res.status(404).json({ error: "Bill not found in mock bank" });
      }
      if (err.response.status === 409) {
        // mock-bank signals already paid → reflect as 409, not 500
        return res.status(409).json({ error: "Bill already paid" });
      }
    }
    // Fallback
    console.error("fetchBillFromMockBank error:", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createBill = async (req, res) => {
  try {
    const user = req.user; // from JWT
    const data = req.body;

    // Validate input
    validateBillInput(data);

    // Ensure unique bill number
    const existing = await Bill.findOne({
      where: { bill_number: data.bill_number },
    });
    if (existing) {
      return res.status(409).json({ error: "Bill number already exists" });
    }

    // Create new bill
    const bill = await Bill.create({
      ...data,
      status: "CREATED",
      created_by: user.id,
      municipality_id: user.municipality_id || null,
    });

    res.status(201).json({ message: "Bill created successfully", bill });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
