const axios = require("axios");
const { Op } = require("sequelize");
const Bill = require("../models/Bill");
const PaymentLink = require("../models/PaymentLink");

function todayKey() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}${mm}${dd}`;
}

exports.createPayLink = async (req, res) => {
  try {
    const { bill_number, channel } = req.body || {};
    if (!bill_number) return res.status(400).json({ error: "bill_number is required" });

    const bill = await Bill.findOne({ where: { bill_number } });
    if (!bill) return res.status(404).json({ error: "Bill not found" });
    if (["PAID","EXPIRED","CANCELLED"].includes(bill.status)) {
      return res.status(409).json({ error: `Cannot create link for status ${bill.status}` });
    }

    const linkId = `${bill.bill_number}-${todayKey()}`;
    const existing = await PaymentLink.findOne({ where: { link_id: linkId } });
    if (existing) {
      return res.json({ message: "Existing link", link: existing, bill });
    }

    const amount = Number(bill.total_amount || 0);
    if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });

    const haveCashfree = !!(process.env.CASHFREE_CLIENT_ID && process.env.CASHFREE_CLIENT_SECRET && process.env.CASHFREE_BASE_URL && process.env.CASHFREE_API_VERSION);

    if (!haveCashfree) {
      const mockUrl = `https://pay.mock/${encodeURIComponent(linkId)}`;
      const link = await PaymentLink.create({
        bill_id: bill.id,
        cf_link_id: null,
        link_id: linkId,
        link_url: mockUrl,
        amount,
        currency: "INR",
        expires_at: null,
        status: "ACTIVE",
      });
      await bill.update({ status: "LINK_SENT" });
      return res.status(201).json({ message: "Link created", link, bill });
    }

    const body = {
      customer_details: { customer_email: bill.email, customer_name: bill.consumer_name },
      link_amount: amount,
      link_currency: "INR",
      link_purpose: `Water bill ${bill.bill_number}`,
      link_notify: { send_email: false, send_sms: false },
      link_meta: { return_url: `${process.env.APP_BASE_URL || "http://localhost:3000"}/thank-you?bill=${bill.bill_number}` }
    };

    const cfRes = await axios.post(
      `${process.env.CASHFREE_BASE_URL}/links`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-version": process.env.CASHFREE_API_VERSION,
          "x-client-id": process.env.CASHFREE_CLIENT_ID,
          "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
          "x-idempotency-key": linkId
        },
        timeout: 15000
      }
    );

    const data = cfRes.data;
    const link = await PaymentLink.create({
      bill_id: bill.id,
      cf_link_id: data?.link_id || null,
      link_id: linkId,
      link_url: data?.link_url || null,
      amount,
      currency: "INR",
      expires_at: data?.link_expiry_time ? new Date(data.link_expiry_time) : null,
      status: "ACTIVE"
    });

    await bill.update({ status: "LINK_SENT" });
    return res.status(201).json({ message: "Link created", link, bill });
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status || 500).json({ error: err.response.data || "Cashfree error" });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
