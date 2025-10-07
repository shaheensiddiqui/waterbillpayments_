const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const EmailLog = sequelize.define("EmailLog", {
  to_email: { type: DataTypes.STRING, allowNull: false },
  subject: { type: DataTypes.STRING, allowNull: false },
  body: { type: DataTypes.TEXT },
  bill_id: { type: DataTypes.INTEGER, allowNull: false },
  sent_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  provider_message_id: { type: DataTypes.STRING },
});

module.exports = EmailLog;
