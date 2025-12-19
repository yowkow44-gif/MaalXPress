const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
// 👇 THIS LINE IS IMPORTANT
const { sendNotification } = require("../controllers/notificationController");
const {
  setDepositWallet,

  // Dashboard
  getStats,

  // Deposit
  getDepositRequests,
  approveDeposit,
  rejectDeposit,

  // Withdraw
  getWithdrawRequests,
  approveWithdraw,
  rejectWithdraw,

  // Balance
  updateBalance,

  // Users
  searchUsers,
  resetUser,

  // Address
  updateDepositAddress
} = require("../controllers/adminController");

/* ======================================================
   ✅ EXISTING ROUTE (UNCHANGED)
====================================================== */
router.post("/set-deposit-wallet", auth, setDepositWallet);

router.post(
   "/send-notification",
   adminMiddleware,
   sendNotification
 );

/* ======================================================
   🔐 ADMIN PROTECTED ROUTES
====================================================== */
router.use(adminMiddleware);

/* ================= DASHBOARD ================= */
router.get("/stats", getStats);

/* ================= DEPOSIT ================= */
router.get("/deposit-requests", getDepositRequests);
router.post("/deposit-requests/:id/approve", approveDeposit);
router.post("/deposit-requests/:id/reject", rejectDeposit);

/* ================= WITHDRAW ================= */
router.get("/withdraw-requests", getWithdrawRequests);
router.post("/withdraw-requests/:id/approve", approveWithdraw);
router.post("/withdraw-requests/:id/reject", rejectWithdraw);

/* ================= BALANCE ================= */
router.post("/update-balance", updateBalance);

/* ================= USERS ================= */
router.get("/search-users", searchUsers);
router.post("/reset-user/:userId", resetUser);

/* ================= DEPOSIT ADDRESS ================= */
router.post("/update-deposit-address", updateDepositAddress);

module.exports = router;
