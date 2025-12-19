// ================================
//        IMPORTS
// ================================
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

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

// ✅ CORS (Frontend Allow)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// ✅ Body Parser (REQUIRED FOR LOGIN/SIGNUP)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(express.urlencoded({ extended: true }));

// ================================
//   SERVE UPLOADED IMAGES STATICALLY
// ================================
app.use("/uploads", (req, res, next) => {
  res.setHeader("Content-Disposition", "inline");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
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
const MONGO_URL = process.env.MONGO_URL;

mongoose
  .connect(MONGO_URL, { dbName: "GrabWebsite" })
  .then(() => console.log("🔥 MongoDB connected successfully"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// ================================
//        API ROUTES
// ================================

// ✅ AUTH (Signup / Login)
app.use("/api/auth", authRoutes);



// ✅ ORDERS
app.use("/api/orders", orderRoutes);

// ✅ DEPOSIT / WITHDRAW
app.use("/api/deposit", depositRoutes);
app.use("/api/withdraw", withdrawRoutes);

// ✅ REFERRALS / SERVICES / TRANSACTIONS
app.use("/api/referrals", referralRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/transactions", transactionRoutes);

// ✅ ADMIN
app.use("/api/admin", adminRoutes);
app.use("/api/deposit", require("./routes/depositRoutes"));
app.use("/admin", require("./routes/admin"));
app.use("/deposit", require("./routes/depositRoutes"));
app.use("/withdraw", require("./routes/withdrawRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/notifications", notificationRoutes);
// ================================
//   DEFAULT ROUTE (FOR TEST)
// ================================
app.get("/", (req, res) => {
  res.json({ success: true, message: "Backend API Working 🚀" });
});

// ================================
//        START SERVER
// ================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Backend running on port ${PORT}`)
);
