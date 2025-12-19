const router = require('express').Router();

const {
  signup,
  login,
  getAllUsers,
  getMyProfile,
  saveWallet
} = require('../controllers/authController');

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const resetTodayProfit = require("../middleware/resetTodayProfit");

router.post('/signup', signup);
router.post('/login', login);

// ✅ SAVE WALLET
router.post("/wallet", authMiddleware, saveWallet);

// ✅ PROFILE
router.get('/me', authMiddleware, resetTodayProfit, getMyProfile);

// ✅ ADMIN
router.get('/users', authMiddleware, adminMiddleware, getAllUsers);

module.exports = router;
