const cron = require("node-cron");
const DepositRequest = require("../models/DepositRequest");
const WithdrawRequest = require("../models/WithdrawRequest");

// ⏰ Daily at 2 AM (safe time)
cron.schedule("0 2 * * *", async () => {
  try {
    const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;
    const cutoffDate = new Date(Date.now() - THIRTY_DAYS);

    // 🔥 DELETE OLD APPROVED / REJECTED DEPOSITS
    const depositResult = await DepositRequest.deleteMany({
      status: { $in: ["approved", "rejected"] },
      createdAt: { $lt: cutoffDate }
    });

    // 🔥 DELETE OLD APPROVED / REJECTED WITHDRAWS
    const withdrawResult = await WithdrawRequest.deleteMany({
      status: { $in: ["approved", "rejected"] },
      createdAt: { $lt: cutoffDate }
    });

    console.log("🧹 History Cleanup Done:", {
      depositsDeleted: depositResult.deletedCount,
      withdrawsDeleted: withdrawResult.deletedCount
    });
  } catch (error) {
    console.error("❌ History Cleanup Failed:", error);
  }
});
