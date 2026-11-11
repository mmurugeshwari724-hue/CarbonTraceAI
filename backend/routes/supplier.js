const express = require("express");
const router = express.Router();

const {
    getSuppliers,
    getMySupplier
} = require("../controllers/supplierController");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

router.get("/mine", protect, getMySupplier);
router.get("/", protect, adminOnly, getSuppliers);

module.exports = router;