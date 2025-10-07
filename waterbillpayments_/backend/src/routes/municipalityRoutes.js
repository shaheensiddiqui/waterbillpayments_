const express = require("express");
const router = express.Router();
const { getMunicipalityById } = require("../controllers/municipalityController");

const {
  createMunicipality,
  getAllMunicipalities,
} = require("../controllers/municipalityController");

const auth = require("../middleware/authMiddleware");
const allow = require("../middleware/roleMiddleware");

// SuperAdmin only routes
router.post("/", auth, allow(["SUPERADMIN"]), createMunicipality);
router.get("/", auth, allow(["SUPERADMIN"]), getAllMunicipalities);

router.get("/:id", auth, getMunicipalityById);
module.exports = router;


