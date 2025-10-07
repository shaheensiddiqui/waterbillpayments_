const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Municipality = require("../models/Municipality");
const { validateUserInput } = require("../utils/validate");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, municipality_id } = req.body;
    validateUserInput({ name, email, password });

    // Validate role input
    if (!["SUPERADMIN", "ADMIN", "OPERATOR"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Check duplicate email
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const creator = req.user;

    // 🔹 SuperAdmin can create Admin or Operator (must include municipality_id)
    if (creator.role === "SUPERADMIN") {
      if (role === "SUPERADMIN") {
        return res.status(403).json({ error: "Cannot create another SuperAdmin" });
      }
      if (!municipality_id) {
        return res.status(400).json({ error: "municipality_id is required" });
      }
    }

    // 🔹 Admin can create only Operators (auto-assign their municipality)
    if (creator.role === "ADMIN" && role !== "OPERATOR") {
      return res.status(403).json({ error: "Admins can only create Operators" });
    }

    if (creator.role === "ADMIN" && role === "OPERATOR") {
      // Fetch admin’s record to get their municipality_id
      const adminUser = await User.findByPk(creator.id);
      req.body.municipality_id = adminUser.municipality_id;
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password_hash: hash,
      role,
      municipality_id: req.body.municipality_id || null,
    });

    res.status(201).json({
      message: `${role} created successfully`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        municipality_id: user.municipality_id,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email & password required" });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    // Include municipality_id in the token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        municipality_id: user.municipality_id || null,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    // 🔹 Also return municipality_id in response so frontend can store it
    res.json({
      token,
      role: user.role,
      name: user.name,
      municipality_id: user.municipality_id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
