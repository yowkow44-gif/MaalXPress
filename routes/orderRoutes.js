// backend/routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const { createOrder, getOrdersByPlatform, submitOrder } = require("../controllers/orderController");
const { uploadCsvController } = require("../controllers/orderCsvController");

// Multer storage to preserve extension
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../uploads/orders"));
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const name = Date.now() + "-" + Math.random().toString(36).slice(2, 7) + ext;
        cb(null, name);
    }
});
const upload = multer({ storage });

// ADMIN → create single order (use field name 'image')
router.post("/create-single", auth, admin, upload.single("image"), createOrder);

// ADMIN → create combine order (use field name 'images')
router.post("/create-combine", auth, admin, upload.array("images", 5), createOrder);

// CSV UPLOAD ROUTE (ADMIN ONLY)
router.post(
    "/upload-csv",
    auth,
    admin,
    upload.single("csvFile"),
    uploadCsvController
);


// PUBLIC (or auth optional) → Get platform orders (Amazon/Alibaba/AliExpress)
// frontend hits: GET /api/orders/platform/amazon
router.get("/platform/:platform", auth, getOrdersByPlatform);
// If you want public access without auth, replace `auth` with no middleware.


// USER → submit order (auth required)
router.post("/submit", auth, submitOrder);

module.exports = router;
