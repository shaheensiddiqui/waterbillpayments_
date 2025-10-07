const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./User");
const Municipality = require("./Municipality");

const Bill = sequelize.define("Bill", {
  bill_number: { type: DataTypes.STRING, unique: true, allowNull: false },
  consumer_name: DataTypes.STRING,
  email: DataTypes.STRING,
  address: DataTypes.TEXT,
  service_period_start: DataTypes.DATEONLY,
  service_period_end: DataTypes.DATEONLY,
  due_date: DataTypes.DATEONLY,
  base_amount: DataTypes.DECIMAL(10, 2),
  penalty_amount: DataTypes.DECIMAL(10, 2),
  total_amount: DataTypes.DECIMAL(10, 2),
  status: {
    type: DataTypes.ENUM(
      "CREATED",
      "LINK_SENT",
      "PAYMENT_PENDING",
      "PAID",
      "CANCELLED",
      "EXPIRED",
      "UNPAID" 
    ),
    defaultValue: "CREATED"
  },
  bank_ref: DataTypes.STRING,
  created_by: { type: DataTypes.INTEGER, allowNull: true },
  municipality_id: { type: DataTypes.INTEGER, allowNull: true },
});

Bill.belongsTo(User, { foreignKey: "created_by", as: "operator" });
Bill.belongsTo(Municipality, { foreignKey: "municipality_id" });

module.exports = Bill;
