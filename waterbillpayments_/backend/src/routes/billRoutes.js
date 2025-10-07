const express = require("express");
const router = express.Router();

const {
  createBill,
  fetchBillFromMockBank,
  getAllBills,
  getBillByNumber,
} = require("../controllers/billController");

const { sendPaymentEmail } = require("../controllers/emailController");
const auth = require("../middleware/authMiddleware");
const allow = require("../middleware/roleMiddleware");

router.post("/fetch", auth, allow(["OPERATOR", "ADMIN"]), fetchBillFromMockBank);
router.post("/create", auth, allow(["OPERATOR", "ADMIN"]), createBill);
router.get("/all", auth, allow(["OPERATOR", "ADMIN"]), getAllBills);
router.get("/:billNumber", auth, allow(["OPERATOR", "ADMIN"]), getBillByNumber);

router.post("/email/paylink", auth, allow(["OPERATOR", "ADMIN"]), sendPaymentEmail);

module.exports = router;
