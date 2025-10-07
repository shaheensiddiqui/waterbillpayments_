const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

const PORT = 5001;
const filePath = path.join(__dirname, "bills.json");

// Helper functions
function readBills() {
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

function writeBills(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// GET /mock-bank/bills/:billNumber
app.get("/mock-bank/bills/:billNumber", (req, res) => {
  const bills = readBills();
  const bill = bills[req.params.billNumber];

  if (!bill) {
    return res.status(404).json({ error: "Bill not found" });
  }

  if (bill.status === "PAID") {
    return res.status(409).json({ error: "Bill already paid" });
  }

  res.json(bill);
});

// POST /mock-bank/bills/:billNumber/mark-paid
app.post("/mock-bank/bills/:billNumber/mark-paid", (req, res) => {
  const { payment_ref, paid_amount, paid_at } = req.body;
  const bills = readBills();
  const bill = bills[req.params.billNumber];

  if (!bill) {
    return res.status(404).json({ error: "Bill not found" });
  }

  if (bill.status === "PAID") {
    return res.status(409).json({ error: "Bill already paid" });
  }

  if (parseFloat(paid_amount) !== parseFloat(bill.total_amount)) {
    return res.status(422).json({ error: "Amount mismatch" });
  }

  bill.status = "PAID";
  bill.payment_ref = payment_ref;
  bill.paid_amount = paid_amount;
  bill.paid_at = paid_at;

  bills[req.params.billNumber] = bill;
  writeBills(bills);

  res.json({ message: "Bill marked as paid", bill });
});

app.listen(PORT, () => {
  console.log(`Mock Bank API running on http://localhost:${PORT}`);
});
