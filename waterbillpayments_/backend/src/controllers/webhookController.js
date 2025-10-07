const crypto = require("crypto");
const WebhookEvent = require("../models/WebhookEvent");
const Bill = require("../models/Bill");
const Transaction = require("../models/Transaction");
const axios = require("axios");

exports.cashfreeWebhook = async (req, res) => {
  try {
    const rawBody = JSON.stringify(req.body);
    const signature = req.headers["x-webhook-signature"];
    const timestamp = req.headers["x-webhook-timestamp"];
    const secret = process.env.WEBHOOK_SECRET;

    // Compute expected signature
    const expected = crypto
      .createHmac("sha256", secret)
      .update(timestamp + rawBody)
      .digest("base64");

    const verified = signature === expected;

    // Log every webhook
    const webhookLog = await WebhookEvent.create({
      type: req.body.type,
      raw_payload: req.body,
      headers: req.headers,
      verified,
      received_at: new Date(),
      status: "RECEIVED",
    });

    if (!verified) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    const event = req.body;

    // Handle payment success
    if (event.type === "PAYMENT_SUCCESS_WEBHOOK" || event.type === "payment.success") {
      const order = event.data?.order;
      const payment = event.data?.payment;

      if (!order || !payment) {
        return res.status(400).json({ error: "Invalid payload" });
      }

      // Find the bill using link_id in order_tags
      const linkId = order?.order_tags?.link_id;
      if (!linkId) {
        console.log("No link_id in webhook payload");
        return res.status(200).json({ message: "No linked bill found" });
      }

      const bill = await Bill.findOne({ where: { bill_number: linkId } });
      if (!bill) {
        console.log("Bill not found for webhook:", linkId);
        return res.status(200).json({ message: "Bill not found" });
      }

      // Mark bill as paid
      await bill.update({ status: "PAID" });

      // Create transaction record
      await Transaction.create({
        bill_id: bill.id,
        cf_order_id: order.order_id,
        amount: order.order_amount,
        currency: order.order_currency,
        mode: payment.payment_method?.card?.card_network || "unknown",
        cf_payment_id: payment.cf_payment_id,
        status: payment.payment_status,
      });

      // Call mock bank to mark bill paid
      const base = process.env.MOCK_BANK_URL || "http://localhost:5001";
      try {
        await axios.post(`${base}/mock-bank/bills/${bill.bill_number}/mark-paid`, {
          payment_ref: payment.cf_payment_id,
          paid_amount: order.order_amount,
          paid_at: payment.payment_time,
        });
      } catch (mockErr) {
        console.log("Mock bank mark-paid failed:", mockErr.message);
      }

      await webhookLog.update({
        processed_at: new Date(),
        status: "PROCESSED",
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Webhook processing error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
