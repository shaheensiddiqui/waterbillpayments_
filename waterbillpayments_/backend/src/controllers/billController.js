const axios = require("axios");
const Bill = require("../models/Bill");
const { validateBillInput } = require("../utils/validateBillInput");


exports.fetchBillFromMockBank = async (req, res) => {
  try {
    const { billNumber, bill_number } = req.body || {};
    const billNum = (billNumber || bill_number || "").trim();

    if (!billNum) {
      return res.status(400).json({ error: "Bill number is required" });
    }

    const user = req.user;

    // 1. Check if bill already exists locally
    let bill = await Bill.findOne({ where: { bill_number: billNum } });
    if (bill) {
      console.log("Found bill in local database");
      return res.json({ message: "Bill fetched from database", bill });
    }

    // 2. If not found, fetch from mock-bank
    const base = process.env.MOCK_BANK_URL || "http://localhost:5001";
    const url = `${base}/mock-bank/bills/${encodeURIComponent(billNum)}`;

    const mockRes = await axios.get(url);
    const data = mockRes.data;

    console.log("MockBank returned status:", data.status);

    // 3. Save to DB (upsert new record)
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
          "UNPAID",
        ];
        return allowed.includes(s) ? s : "CREATED";
      })(),
      bank_ref: data.bank_ref || null,
      created_by: user?.id || null,
      municipality_id: user?.municipality_id || null,
    });

    console.log("Bill saved to local database");
    return res.json({ message: "Bill fetched successfully", bill });
  } catch (err) {
    if (err.response) {
      if (err.response.status === 404) {
        return res.status(404).json({ error: "Bill not found in mock bank" });
      }
      if (err.response.status === 409) {
        return res.status(409).json({ error: "Bill already paid" });
      }
    }
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

exports.getAllBills = async (req, res) => {
  try {
    const user = req.user;

    const whereClause =
      user.role === "OPERATOR"
        ? { created_by: user.id }
        : user.role === "ADMIN"
        ? { municipality_id: user.municipality_id }
        : {};

    const bills = await Bill.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

