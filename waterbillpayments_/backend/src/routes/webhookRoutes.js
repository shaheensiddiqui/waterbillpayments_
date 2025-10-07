const express = require("express");
const router = express.Router();
const { cashfreeWebhook } = require("../controllers/webhookController");

router.post("/cashfree", cashfreeWebhook);

module.exports = router;
