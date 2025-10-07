const Bill = require("../models/Bill");
const PaymentLink = require("../models/PaymentLink");
const EmailLog = require("../models/EmailLog");
const sendEmail = require("../utils/sendEmail");

exports.sendPaymentEmail = async (req, res) => {
  try {
    const { bill_number, to_email } = req.body;
    if (!bill_number || !to_email)
      return res.status(400).json({ error: "bill_number and to_email are required" });

    const bill = await Bill.findOne({ where: { bill_number } });
    if (!bill) return res.status(404).json({ error: "Bill not found" });

    const link = await PaymentLink.findOne({
      where: { bill_id: bill.id },
      order: [["createdAt", "DESC"]],
    });
    if (!link) return res.status(404).json({ error: "Payment link not found" });

    const html = `
      <h3>Municipal Water Bill</h3>
      <p>Dear ${bill.consumer_name},</p>
      <p>Your water bill amount is <strong>₹${bill.total_amount}</strong> due on ${bill.due_date}.</p>
      <p>Please pay using the link below:</p>
      <p><a href="${link.link_url}" target="_blank">${link.link_url}</a></p>
      <p>Thank you,</p>
      <p>Municipal Water Department</p>
    `;

    const messageId = await sendEmail({
      to: to_email,
      subject: `Water Bill Payment Link - ${bill.bill_number}`,
      html,
    });

    await EmailLog.create({
      to_email,
      subject: `Water Bill Payment Link - ${bill.bill_number}`,
      body: html,
      bill_id: bill.id,
      provider_message_id: messageId,
    });

    bill.status = "LINK_SENT";
    await bill.save();

    res.json({ message: "Email sent successfully", bill });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
