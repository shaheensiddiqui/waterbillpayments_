const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const Bill = require("../models/Bill");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/api/transactions", authMiddleware, async (req, res) => {
  try {
    const user = req.user; 
    let whereCondition = {};

    if (user.role === "OPERATOR" && user.municipality_id) {
      whereCondition = { municipality_id: user.municipality_id };
    }

    if (user.role === "ADMIN" && user.municipality_id) {
      whereCondition = { municipality_id: user.municipality_id };
    }

    const transactions = await Transaction.findAll({
      include: [
        {
          model: Bill,
          attributes: ["bill_number", "municipality_id"],
          where: whereCondition,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(transactions);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

module.exports = router;
