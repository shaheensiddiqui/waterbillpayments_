const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");
const allow = require("../middleware/roleMiddleware");

// Register routes
router.post("/register", auth, allow(["SUPERADMIN", "ADMIN"]), register);
router.post("/login", login);

router.post("/create-admin", auth, allow(["SUPERADMIN"]), register);

module.exports = router;
