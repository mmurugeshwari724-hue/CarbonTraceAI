const express = require("express");
const router = express.Router();

const Activity = require("../models/activity");
const Supplier = require("../models/supplier");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

// Demo emission factors.
// The units must match the units used for the activity.

const factors = {
    electricity: 0.70,
    diesel: 2.68,
    petrol: 2.31,
    naturalGas: 2.0,
    airFreight: 0.60,
    roadFreight: 0.12,
    water: 0.0003,
    waste: 0.45
};

// ADD ACTIVITY
router.post("/", protect, async (req, res) => {
    try {
        const {
            category,
            quantity,
            unit,
            activityDate
        } = req.body;

        const amount = Number(quantity);

        if (
            !category ||
            !unit ||
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            return res.status(400).json({
                message: "Enter valid activity details"
            });
        }

        if (factors[category] === undefined) {
            return res.status(400).json({
                message: "Unsupported activity category"
            });
        }

        const supplier = await Supplier.findOne({
            user: req.user._id
        });

        if (!supplier) {
            return res.status(404).json({
                message: "Supplier profile not found"
            });
        }

        const factor = factors[category];
        const emissions = amount * factor;

        const activity = await Activity.create({
            supplier: supplier._id,
            category,
            quantity: amount,
            unit,
            activityDate: activityDate || new Date(),
            emissionFactor: factor,
            emissionsKgCO2e: Number(emissions.toFixed(2))
        });

        res.status(201).json({
            message: "Activity added successfully",
            activity
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// GET LOGGED-IN SUPPLIER ACTIVITIES
router.get("/mine", protect, async (req, res) => {
    try {
        const supplier = await Supplier.findOne({
            user: req.user._id
        });

        if (!supplier) {
            return res.status(404).json({
                message: "Supplier profile not found"
            });
        }

        const activities = await Activity.find({
            supplier: supplier._id
        }).sort({ activityDate: -1 });

        res.json(activities);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// GET ALL ACTIVITIES - ADMIN ONLY
router.get("/all", protect, adminOnly, async (req, res) => {
    try {
        const activities = await Activity.find()
            .populate({
                path: "supplier",
                select: "companyName user",
                populate: {
                    path: "user",
                    select: "name email"
                }
            })
            .sort({ activityDate: -1 });

        res.json(activities);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;