const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || "mysql",
    logging: false,
  }
);

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("DB connected successfully");
  } catch (err) {
    console.error("DB connection failed:", err.message);
    process.exit(1);
  }
}

module.exports = { sequelize, connectDB };
