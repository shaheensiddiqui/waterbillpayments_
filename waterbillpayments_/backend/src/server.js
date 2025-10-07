const express = require("express");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { connectDB } = require("./config/db");
const { syncModels, User } = require("./models");

const authRoutes = require("./routes/authRoutes");
const municipalityRoutes = require("./routes/municipalityRoutes");



const app = express();
app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/municipalities", municipalityRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const billRoutes = require("./routes/billRoutes");
app.use("/api/bills", billRoutes);

const paylinkRoutes = require("./routes/paylinkRoutes");
app.use("/api/paylinks", paylinkRoutes);




// Seeder function for SuperAdmin
async function seedSuperAdmin() {
  const email = "superadmin@municipal.gov";
  const password = "Super@123";
  const name = "Default Super Admin";

  const existing = await User.findOne({ where: { email } });
  if (!existing) {
    const hash = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email,
      password_hash: hash,
      role: "SUPERADMIN",
    });

    console.log("Default SuperAdmin created:");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  } else {
    console.log("SuperAdmin already exists:", email);
  }
}

// start server
const PORT = process.env.PORT || 4000;

(async () => {
  await connectDB();
  await syncModels();
  await seedSuperAdmin();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();
