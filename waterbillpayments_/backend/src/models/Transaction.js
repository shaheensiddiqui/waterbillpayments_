const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Bill = require("./Bill");

const Transaction = sequelize.define("Transaction", {
  bill_id: { type: DataTypes.INTEGER, allowNull: false },
  cf_order_id: DataTypes.STRING,
  payment_session_id: DataTypes.STRING,
  amount: DataTypes.DECIMAL(10, 2),
  currency: { type: DataTypes.STRING, defaultValue: "INR" },
  mode: DataTypes.STRING,
  cf_payment_id: DataTypes.STRING,
  status: DataTypes.STRING,
});

Transaction.belongsTo(Bill, { foreignKey: "bill_id" });

module.exports = Transaction;
