const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const WebhookEvent = sequelize.define("WebhookEvent", {
  type: DataTypes.STRING,
  raw_payload: DataTypes.JSON,
  headers: DataTypes.JSON,
  verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  received_at: DataTypes.DATE,
  processed_at: DataTypes.DATE,
  status: DataTypes.STRING,
});

module.exports = WebhookEvent;
