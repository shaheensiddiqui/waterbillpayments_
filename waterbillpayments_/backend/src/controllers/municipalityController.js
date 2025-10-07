const Municipality = require("../models/Municipality");
const User = require("../models/User");

exports.createMunicipality = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: "Municipality name is required" });
    }

    const existing = await Municipality.findOne({ where: { name } });
    if (existing) {
      return res.status(409).json({ error: "Municipality already exists" });
    }

    const municipality = await Municipality.create({
      name: name.trim(),
      created_by: req.user.id, 
    });

    res.status(201).json({
      message: "Municipality created successfully",
      municipality,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllMunicipalities = async (req, res) => {
  try {
    const municipalities = await Municipality.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "name", "email", "role"],
        },
      ],
    });
    res.json(municipalities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMunicipalityById = async (req, res) => {
  try {
    const { id } = req.params;
    const municipality = await Municipality.findByPk(id);

    if (!municipality) {
      return res.status(404).json({ error: "Municipality not found" });
    }

    res.json(municipality);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

