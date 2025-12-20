// ================================
//        IMPORTS
// ================================
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// ================================
//   ENSURE UPLOAD DIRECTORIES
// ================================
const baseUploadDir = path.join(__dirname, "uploads");
const ordersDir = path.join(baseUploadDir, "orders");
const depositsDir = path.join(baseUploadDir, "deposits");

[baseUploadDir, ordersDir, depositsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ================================
//        ROUTES IMPORT
// ================================
const authRoutes = require("./routes/authRoutes");
const depositRoutes = require("./routes/depositRoutes");
const withdrawRoutes = require("./routes/withdrawRoutes");
const referralRoutes = require("./routes/referralRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const adminRoutes = require("./routes/admin");
const orderRoutes = require("./routes/orderRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// ================================
//        INITIALIZE APP
// ================================
const app = express();

// ================================
//        CORS
// ================================
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// ================================
//        BODY PARSER
// ================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ================================
//   SERVE UPLOADED FILES
// ================================
app.use("/uploads", (req, res, next) => {
  res.setHeader("Content-Disposition", "inline");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

app.use(
  "/uploads",
  express.static(baseUploadDir, {
    setHeaders: (res, filePath) => {
      const lower = filePath.toLowerCase();

      if (lower.endsWith(".png")) res.setHeader("Content-Type", "image/png");
      if (lower.endsWith(".jpg") || lower.endsWith(".jpeg"))
        res.setHeader("Content-Type", "image/jpeg");
      if (lower.endsWith(".webp")) res.setHeader("Content-Type", "image/webp");
      if (lower.endsWith(".gif")) res.setHeader("Content-Type", "image/gif");

      res.setHeader("Content-Disposition", "inline");
    },
  })
);

// ================================
//        CONNECT MONGODB
// ================================
mongoose
  .connect(process.env.MONGO_URL, { dbName: "GrabWebsite" })
  .then(() => console.log("🔥 MongoDB connected successfully"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

  // ================================
//   CRON JOBS (AUTO CLEANUP)
// ================================
require("./jobs/cleanupHistory");


// ================================
//        API ROUTES
// ================================
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/deposit", depositRoutes);
app.use("/api/withdraw", withdrawRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

// ================================
//        HEALTH CHECK
// ================================
app.get("/", (req, res) => {
  res.json({ success: true, message: "Backend API Working 🚀" });
});

// ================================
//   GLOBAL ERROR HANDLER (OPTIONAL)
// ================================
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

// ================================
//        START SERVER
// ================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
