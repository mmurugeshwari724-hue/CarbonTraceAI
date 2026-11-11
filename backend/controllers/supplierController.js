const Supplier = require("../models/supplier");

// GET ALL SUPPLIERS - ADMIN ONLY
exports.getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find()
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        res.json(suppliers);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// GET LOGGED-IN SUPPLIER PROFILE
exports.getMySupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findOne({
            user: req.user._id
        }).populate("user", "name email");

        if (!supplier) {
            return res.status(404).json({
                message: "Supplier profile not found"
            });
        }

        res.json(supplier);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};