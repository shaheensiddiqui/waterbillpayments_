const express = require("express");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { connectDB } = require("./config/db");
const { syncModels, User } = require("./models");

// Routes
const authRoutes = require("./routes/authRoutes");
const municipalityRoutes = require("./routes/municipalityRoutes");
const userRoutes = require("./routes/userRoutes");
const billRoutes = require("./routes/billRoutes");
const paylinkRoutes = require("./routes/paylinkRoutes");
const { cashfreeWebhook } = require("./controllers/webhookController");
const transactionRoutes = require("./routes/transactionRoutes");


const app = express();


app.post(
  "/webhooks/cashfree",
  express.raw({ type: "*/*" }),
  (req, res, next) => {
    req.rawBody = req.body.toString();
    try {
      req.body = JSON.parse(req.rawBody);
    } catch {
      req.body = {};
    }
    next();
  },
  cashfreeWebhook
);


app.use(cors());
app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/municipalities", municipalityRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/paylinks", paylinkRoutes);
app.use(transactionRoutes);


//seed super admin details
async function seedSuperAdmin() {
  const email = "superadmin@gmail.com";
  const password = "Super@123";
  const name = "Default Super Admin";

  const existing = await User.findOne({ where: { email } });
  if (!existing) {
    const hash = await bcrypt.hash(password, 10);
    await User.create({ name, email, password_hash: hash, role: "SUPERADMIN" });
    console.log(`✅ Default SuperAdmin created — ${email} / ${password}`);
  } else {
    console.log(`SuperAdmin already exists: ${email}`);
  }
}


const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await connectDB();
    await syncModels();
    await seedSuperAdmin();
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ Server start failed:", err.message);
  }
})();
