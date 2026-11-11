const express = require("express");
const router = express.Router();

const {
    calculateEmission
} = require("../controllers/emissionController");

const { protect } = require("../middleware/authMiddleware");

router.post("/calculate", protect, calculateEmission);

module.exports = router;