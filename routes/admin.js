const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { sendNotification } = require("../controllers/notificationController");

const {
  setDepositWallet,
  getStats,

  getDepositRequests,
  approveDeposit,
  rejectDeposit,

  getWithdrawRequests,
  approveWithdraw,
  rejectWithdraw,

  getDepositHistory,
  getWithdrawHistory,

  updateBalance,
  searchUsers,
  resetUser,
  updateDepositAddress
} = require("../controllers/adminController");

/* ================= PUBLIC ================= */
router.post("/set-deposit-wallet", auth, setDepositWallet);
router.post("/send-notification", adminMiddleware, sendNotification);

/* ================= ADMIN PROTECTED ================= */
router.use(adminMiddleware);

/* DASHBOARD */
router.get("/stats", getStats);

/* HISTORY */
router.get("/deposit-history", getDepositHistory);
router.get("/withdraw-history", getWithdrawHistory);

/* DEPOSIT */
router.get("/deposit-requests", getDepositRequests);
router.post("/deposit-requests/:id/approve", approveDeposit);
router.post("/deposit-requests/:id/reject", rejectDeposit);

/* WITHDRAW */
router.get("/withdraw-requests", getWithdrawRequests);
router.post("/withdraw-requests/:id/approve", approveWithdraw);
router.post("/withdraw-requests/:id/reject", rejectWithdraw);

/* BALANCE */
router.post("/update-balance", updateBalance);

/* USERS */
router.get("/search-users", searchUsers);
router.post("/reset-user/:userId", resetUser);

/* ADDRESS */
router.post("/update-deposit-address", updateDepositAddress);

module.exports = router;
