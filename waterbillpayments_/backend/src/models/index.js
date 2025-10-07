const { sequelize } = require("../config/db");
const User = require("./User");
const Municipality = require("./Municipality");
const Bill = require("./Bill"); // ✅ Add this
const PaymentLink = require("./PaymentLink");


// Associations
Municipality.hasMany(User, { foreignKey: "municipality_id" });
User.belongsTo(Municipality, { foreignKey: "municipality_id" });

Bill.belongsTo(User, { foreignKey: "created_by", as: "creator" });
Bill.belongsTo(Municipality, { foreignKey: "municipality_id" });

async function syncModels() {
  try {
    await sequelize.sync({ alter: true });
    console.log("All models synchronized successfully");
  } catch (err) {
    console.error("Error syncing models:", err.message);
    process.exit(1);
  }
}

module.exports = {
  sequelize,
  User,
  Municipality,
  Bill,       // ✅ Export Bill
  PaymentLink,
  syncModels,
};
