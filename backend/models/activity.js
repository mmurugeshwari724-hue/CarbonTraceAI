const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
        required: true
    },

    category: {
        type: String,
        required: true
    },

    quantity: {
        type: Number,
        required: true,
        min: 0
    },

    unit: {
        type: String,
        required: true
    },

    activityDate: {
        type: Date,
        default: Date.now
    },

    emissionFactor: {
        type: Number,
        required: true
    },

    emissionsKgCO2e: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Activity", activitySchema);