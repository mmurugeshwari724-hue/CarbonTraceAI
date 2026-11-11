const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema({
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    storedName: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Upload", uploadSchema);
