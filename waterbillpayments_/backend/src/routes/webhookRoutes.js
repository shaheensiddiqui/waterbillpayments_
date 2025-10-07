const express = require("express");
const router = express.Router();
const { cashfreeWebhook } = require("../controllers/webhookController");

// Important: Cashfree requires raw body
router.post("/cashfree", express.json({ verify: (req, res, buf) => (req.rawBody = buf) }), cashfreeWebhook);

module.exports = router;
