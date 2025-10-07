const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Bill = require("./Bill");

const PaymentLink = sequelize.define("PaymentLink", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  bill_id: { type: DataTypes.INTEGER, allowNull: false },
  cf_link_id: { type: DataTypes.STRING },
  link_id: { type: DataTypes.STRING, unique: true },
  link_url: { type: DataTypes.STRING },
  amount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  currency: { type: DataTypes.STRING, defaultValue: "INR" },
  expires_at: { type: DataTypes.DATE, allowNull: true },
  status: { type: DataTypes.ENUM("ACTIVE","PAID","CANCELLED","EXPIRED"), defaultValue: "ACTIVE" }
});

PaymentLink.belongsTo(Bill, { foreignKey: "bill_id" });

module.exports = PaymentLink;
