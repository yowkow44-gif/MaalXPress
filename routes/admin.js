const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");

const { sendNotification } = require("../controllers/notificationController");
const {
  getAllUsers,
  searchUsers
} = require(
  "../controllers/adminUsersController"
);

const {
  getSupportSettings,
  updateSupportSettings
} = require(
  "../controllers/supportSettingsController"
);

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

  resetUser,
  updateDepositAddress
} = require("../controllers/adminController");

/* ================= PUBLIC ================= */
router.post("/set-deposit-wallet", setDepositWallet);

router.post(
  "/send-notification",
  sendNotification
);


/* ================= ADMIN PROTECTED ================= */


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
// ================= USERS =================

router.get(
  "/all-users",
  getAllUsers
);

router.get(
  "/search-users",
  searchUsers
);

// ================= SUPPORT =================

router.get(
  "/support-settings",
  getSupportSettings
);

router.post(
  "/support-settings",
  updateSupportSettings
);

module.exports = router;
