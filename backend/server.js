const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const path = require("path");

dotenv.config({
    path: path.join(__dirname, ".env")
});

const connectDB = require("./config/database");

const User = require("./models/user");

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API ROUTES
app.use("/api/auth", require("./routes/auth"));
app.use("/api/suppliers", require("./routes/supplier"));
app.use("/api/activities", require("./routes/activities"));
app.use("/api/emissions", require("./routes/emission"));
app.use("/api/uploads", require("./routes/uploads"));

// HEALTH CHECK
app.get("/", (req, res) => {
    res.json({
        message: "CarbonTraceAI Backend is Running!",
        status: "Online"
    });
});

// CREATE ADMIN ACCOUNT FROM ENVIRONMENT VARIABLES
async function createAdmin() {
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
        console.log("Admin setup skipped. Add ADMIN_EMAIL and ADMIN_PASSWORD to .env.");
        return;
    }

    const email = process.env.ADMIN_EMAIL.toLowerCase();

    let admin = await User.findOne({ email });

    if (!admin) {
        const hashedPassword = await bcrypt.hash(
            process.env.ADMIN_PASSWORD,
            12
        );

        admin = await User.create({
            name: process.env.ADMIN_NAME || "CarbonTraceAI Admin",
            email,
            password: hashedPassword,
            role: "admin"
        });

        console.log("Admin account created successfully!");
    } else if (admin.role !== "admin") {
        throw new Error("ADMIN_EMAIL already belongs to a non-admin account.");
    }
}

// ERROR HANDLER
app.use((err, req, res, next) => {
    console.error(err.message);

    res.status(400).json({
        message: err.message || "Something went wrong"
    });
});

// START SERVER AFTER DATABASE CONNECTION
const startServer = async () => {
    try {
        await connectDB();
        await createAdmin();

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log("----------------------------------");
            console.log("CarbonTraceAI Backend Started");
            console.log(`Server: http://localhost:${PORT}`);
            console.log("MongoDB: Connected");
            console.log("----------------------------------");
        });

    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();