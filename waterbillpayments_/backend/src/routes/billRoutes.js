const express = require("express");
const router = express.Router();
const { createBill, fetchBillFromMockBank, getAllBills } = require("../controllers/billController");
const auth = require("../middleware/authMiddleware");
const allow = require("../middleware/roleMiddleware");

// ✅ Authenticated + role-based access
router.post("/fetch", auth, allow(["OPERATOR", "ADMIN"]), fetchBillFromMockBank);
router.post("/create", auth, allow(["OPERATOR", "ADMIN"]), createBill);

router.get("/all", auth, allow(["OPERATOR", "ADMIN"]), getAllBills);

module.exports = router;
