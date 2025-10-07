const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const User = sequelize.define("User", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { len: [2, 100] },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("SUPERADMIN", "ADMIN", "OPERATOR"),
    allowNull: false,
  },
  municipality_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = User;
