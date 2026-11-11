const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },

    companyName: {
        type: String,
        required: true
    },

    industry: {
        type: String,
        default: "Other"
    },

    location: {
        type: String,
        default: ""
    },

    status: {
        type: String,
        enum: ["Active", "Pending", "Suspended"],
        default: "Active"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Supplier", supplierSchema);