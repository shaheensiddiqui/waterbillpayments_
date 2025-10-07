const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const allow = require("../middleware/roleMiddleware");
const User = require("../models/User");

// GET all users (SuperAdmin only)
router.get("/", auth, allow(["SUPERADMIN"]), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "role"],
      order: [["id", "ASC"]],
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Operators under the Admin's municipality
router.get("/operators", auth, allow(["ADMIN"]), async (req, res) => {
  try {
    const admin = req.user; 
    if (!admin) return res.status(401).json({ error: "Unauthorized" });


    const operators = await User.findAll({
      where: { role: "OPERATOR", municipality_id: admin.municipality_id },
      attributes: ["id", "name", "email", "role"],
      order: [["id", "ASC"]],
    });

    res.json(operators);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
