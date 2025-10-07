const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Municipality = sequelize.define("Municipality", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Municipality;
