const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const express = require("express");
const multer = require("multer");

const Supplier = require("../models/supplier");
const Upload = require("../models/upload");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
const uploadDirectory = path.join(__dirname, "../uploads");

fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
    destination: uploadDirectory,
    filename: (req, file, callback) => {
        callback(null, `${crypto.randomBytes(16).toString("hex")}${path.extname(file.originalname).toLowerCase()}`);
    }
});

const uploadFile = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        const allowedTypes = new Map([
            [".pdf", "application/pdf"],
            [".jpg", "image/jpeg"],
            [".jpeg", "image/jpeg"],
            [".png", "image/png"]
        ]);
        const extension = path.extname(file.originalname).toLowerCase();

        if (allowedTypes.get(extension) !== file.mimetype) {
            return callback(new Error("Only PDF, JPG and PNG files are allowed."));
        }

        callback(null, true);
    }
});

router.get("/mine", protect, async (req, res) => {
    try {
        const supplier = await Supplier.findOne({ user: req.user._id });

        if (!supplier) {
            return res.status(404).json({ message: "Supplier profile not found" });
        }

        const uploads = await Upload.find({ supplier: supplier._id })
            .sort({ createdAt: -1 })
            .select("originalName createdAt");

        res.json(uploads.map(item => ({
            _id: item._id,
            originalName: item.originalName,
            uploadedAt: item.createdAt
        })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/", protect, uploadFile.single("document"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "Please select a document to upload." });
    }

    try {
        const supplier = await Supplier.findOne({ user: req.user._id });

        if (!supplier) {
            await fs.promises.unlink(req.file.path);
            return res.status(404).json({ message: "Supplier profile not found" });
        }

        const upload = await Upload.create({
            supplier: supplier._id,
            originalName: path.basename(req.file.originalname.replace(/\\/g, "/")),
            storedName: req.file.filename
        });

        res.status(201).json({
            message: "Document uploaded successfully.",
            upload: {
                _id: upload._id,
                originalName: upload.originalName,
                uploadedAt: upload.createdAt
            }
        });
    } catch (error) {
        try {
            await fs.promises.unlink(req.file.path);
        } catch (cleanupError) {
            console.error("Unable to remove failed upload:", cleanupError.message);
        }

        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
