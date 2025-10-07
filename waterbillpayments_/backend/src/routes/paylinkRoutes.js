const express = require("express");
const router = express.Router();
const { createPayLink } = require("../controllers/paylinkController");
const auth = require("../middleware/authMiddleware");
const allow = require("../middleware/roleMiddleware");

router.post("/", auth, allow(["OPERATOR","ADMIN"]), createPayLink);

module.exports = router;
