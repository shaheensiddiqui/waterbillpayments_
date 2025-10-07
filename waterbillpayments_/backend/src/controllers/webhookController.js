const crypto = require("crypto");
const { Op } = require("sequelize");
const Bill = require("../models/Bill");
const PaymentLink = require("../models/PaymentLink");
const Transaction = require("../models/Transaction");
const WebhookEvent = require("../models/WebhookEvent");
const axios = require("axios");

// ------------------------------
//  Verify Cashfree webhook signature
// ------------------------------
function verifySignature(req) {
  const secret = process.env.CASHFREE_CLIENT_SECRET;
  const sig = req.headers["x-webhook-signature"];
  const ts = req.headers["x-webhook-timestamp"];

  if (!secret || !sig || !ts) {
    console.warn("❌ Missing signature headers");
    return false;
  }

  // Use raw body from body-parser raw() middleware
  const raw =
    req.rawBody ||
    (Buffer.isBuffer(req.body) ? req.body.toString("utf8") : JSON.stringify(req.body));

  const expected = crypto.createHmac("sha256", secret).update(ts + raw).digest("base64");

  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  const match = a.length === b.length && crypto.timingSafeEqual(a, b);

  console.log("Signature check → Expected:", expected);
  console.log("Signature check → Provided:", sig);
  console.log("Signature verified?", match);

  return match;
}

// ------------------------------
//  Cashfree Webhook Handler
// ------------------------------
exports.cashfreeWebhook = async (req, res) => {
  let webhookLog = null;

  try {
    const event = req.body;
    console.log("\n✅ Received Cashfree webhook:", event.type);

    // 1️⃣ Verify Signature
    const verified = verifySignature(req);
    console.log("🔐 Signature verified:", verified);

    // 2️⃣ Log webhook in DB
    webhookLog = await WebhookEvent.create({
      type: event.type || "UNKNOWN",
      raw_payload: JSON.stringify(event),
      headers: JSON.stringify(req.headers),
      verified,
      received_at: new Date(),
      status: "RECEIVED",
    });

    if (!verified) {
      console.warn("❌ Invalid signature — webhook rejected.");
      return res.status(400).json({ error: "Invalid signature" });
    }

    // 3️⃣ Handle only successful payments
    if (
      event.type === "PAYMENT_SUCCESS_WEBHOOK" ||
      event.type === "payment.success"
    ) {
      const order = event.data?.order;
      const payment = event.data?.payment;

      if (!order || !payment) {
        console.log("❌ Invalid payload structure");
        return res.status(400).json({ error: "Invalid payload" });
      }

      // Extract tags (must have bill_number + link_id)
      const tags = order?.order_tags || {};
      const cfLinkId = tags.cf_link_id || null;
      const ourLinkId = tags.link_id || null;
      const billTag = tags.bill_number || null;

      console.log("🔍 Webhook order_tags:", tags);

      // 4️⃣ Try to find PaymentLink
      const payLink = await PaymentLink.findOne({
        where: {
          [Op.or]: [
            { cf_link_id: cfLinkId },
            { link_id: ourLinkId },
          ],
        },
      });

      if (!payLink && !billTag) {
        console.log("❌ No PaymentLink or bill_number found in webhook");
        return res.status(200).json({ message: "No matching record found" });
      }

      // 5️⃣ Find the bill by tag or by linked PaymentLink
      let bill = null;
      if (billTag) {
        bill = await Bill.findOne({ where: { bill_number: billTag } });
      } else if (payLink) {
        bill = await Bill.findByPk(payLink.bill_id);
      }

      if (!bill) {
        console.log("❌ Bill not found for:", billTag || ourLinkId);
        return res.status(200).json({ message: "Bill not found" });
      }

      console.log(`✅ Found Bill: ${bill.bill_number}`);

      // 6️⃣ Update Bill + PaymentLink
      await bill.update({ status: "PAID" });
      if (payLink) await payLink.update({ status: "PAID" });
      console.log(`💾 Bill ${bill.bill_number} marked as PAID`);

      // 7️⃣ Record Transaction
      await Transaction.create({
        bill_id: bill.id,
        cf_order_id: order.order_id,
        amount: order.order_amount,
        currency: order.order_currency || "INR",
        mode:
          payment.payment_method?.card?.card_network ||
          payment.payment_group ||
          "unknown",
        cf_payment_id: payment.cf_payment_id,
        status: payment.payment_status,
      });
      console.log("💰 Transaction recorded for bill", bill.bill_number);

      // 8️⃣ Notify Mock Bank
      const base = process.env.MOCK_BANK_URL || "http://localhost:5001";
      try {
        await axios.post(`${base}/mock-bank/bills/${bill.bill_number}/mark-paid`, {
          payment_ref: payment.cf_payment_id,
          paid_amount: order.order_amount,
          paid_at: payment.payment_time,
        });
        console.log("🏦 Mock Bank updated successfully");
      } catch (mockErr) {
        console.log("⚠️ Mock Bank update failed:", mockErr.message);
      }

      // 9️⃣ Mark webhook as processed
      await webhookLog.update({
        processed_at: new Date(),
        status: "PROCESSED",
      });
      console.log(`✅ Bill ${bill.bill_number} fully processed`);
    } else {
      console.log(`ℹ️ Ignored event type: ${event.type}`);
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("❌ Webhook error:", err.message);
    if (webhookLog) {
      await webhookLog.update({
        processed_at: new Date(),
        status: "FAILED",
      });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
