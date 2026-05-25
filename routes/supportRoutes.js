const express = require("express");

const router = express.Router();

const {
  getSupportSettings,
  updateSupportSettings
} = require("../controllers/supportController");

const authMiddleware =
  require("../middleware/authMiddleware");

const adminMiddleware =
  require("../middleware/adminMiddleware");

// ======================================
// PUBLIC GET SUPPORT SETTINGS
// ======================================
router.get(
  "/",
  getSupportSettings
);

// ======================================
// ADMIN UPDATE SUPPORT SETTINGS
// ======================================
router.put(
  "/update",
  authMiddleware,
  adminMiddleware,
  updateSupportSettings
);

module.exports = router;