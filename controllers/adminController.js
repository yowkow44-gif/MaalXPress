const User = require("../models/User");
const DepositRequest = require("../models/DepositRequest");
const WithdrawRequest = require("../models/WithdrawRequest");

/* ======================================================
   ✅ EXISTING FUNCTION (UNCHANGED – AS YOU SAID)
====================================================== */
exports.setDepositWallet = async (req, res) => {
    try {
      const { username, address } = req.body;
  
      if (!username || !address) {
        return res.status(400).json({
          success: false,
          message: "Username and address required"
        });
      }
  
      // 🔥 FIX HERE
      const user = await User.findOne({
        $or: [
          { nickname: username },
          { phone: username }
        ]
      });
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
  
      user.depositWallet.address = address;
      user.depositWallet.network = "TRC20";
  
      // optional sync
      user.wallet.address = address;
  
      await user.save();
  
      res.json({
        success: true,
        message: "Deposit address updated"
      });
    } catch (err) {
      console.error("setDepositWallet error:", err);
      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  };
  

/* ======================================================
   📊 DASHBOARD STATS
====================================================== */
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalBalanceAgg = await User.aggregate([
      { $group: { _id: null, total: { $sum: "$totalBalance" } } }
    ]);

    const totalDepositsAgg = await DepositRequest.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalWithdrawAgg = await WithdrawRequest.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalBalance: totalBalanceAgg[0]?.total || 0,
        totalDeposits: totalDepositsAgg[0]?.total || 0,
        totalWithdrawals: totalWithdrawAgg[0]?.total || 0,
        pendingDeposits: await DepositRequest.countDocuments({ status: "pending" }),
        pendingWithdrawals: await WithdrawRequest.countDocuments({ status: "pending" })
      }
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

/* ======================================================
   💰 DEPOSIT REQUESTS
====================================================== */
exports.getDepositRequests = async (req, res) => {
  const requests = await DepositRequest
    .find({ status: "pending" })
    .populate("user", "nickname phone");

  res.json({ success: true, requests });
};

exports.approveDeposit = async (req, res) => {
  const deposit = await DepositRequest.findById(req.params.id);
  if (!deposit) return res.status(404).json({ success: false });

  deposit.status = "approved";
  await deposit.save();

  await User.findByIdAndUpdate(deposit.user, {
    $inc: { totalBalance: deposit.amount }
  });
  

  res.json({ success: true });
};

exports.rejectDeposit = async (req, res) => {
  await DepositRequest.findByIdAndUpdate(req.params.id, {
    status: "rejected"
  });
  res.json({ success: true });
};

/* ======================================================
   💸 WITHDRAW REQUESTS
====================================================== */
exports.getWithdrawRequests = async (req, res) => {
  const requests = await WithdrawRequest
    .find({ status: "pending" })
    .populate("user", "nickname phone");

  res.json({ success: true, requests });
};

exports.approveWithdraw = async (req, res) => {
  const withdraw = await WithdrawRequest.findById(req.params.id);
  if (!withdraw) return res.status(404).json({ success: false });

  withdraw.status = "approved";
  await withdraw.save();

  await User.findByIdAndUpdate(withdraw.user, {
    $inc: { totalBalance: -withdraw.amount }
  });
  

  res.json({ success: true });
};

exports.rejectWithdraw = async (req, res) => {
  await WithdrawRequest.findByIdAndUpdate(req.params.id, {
    status: "rejected"
  });
  res.json({ success: true });
};

/* ======================================================
   🧮 UPDATE USER BALANCE (ADMIN)
====================================================== */
exports.updateBalance = async (req, res) => {
    const { username, amount } = req.body;
  
    if (!username || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Username and amount required"
      });
    }
  
    // IMPORTANT FIX 👇
    const user = await User.findOne({
      $or: [
        { nickname: username },
        { phone: username }
      ]
    });
  
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
  
    user.totalBalance += Number(amount);
    await user.save();
  
    res.json({
      success: true,
      message: "Balance updated successfully"
    });
  };
  

/* ======================================================
   🔍 SEARCH USERS
====================================================== */
exports.searchUsers = async (req, res) => {
  const query = req.query.query;

  const users = await User.find({
    $or: [
      { username: new RegExp(query, "i") },
      { nickname: new RegExp(query, "i") }
    ]
  });

  res.json({ success: true, users });
};

/* ======================================================
   ♻ RESET USER
====================================================== */
exports.resetUser = async (req, res) => {
  await User.findByIdAndUpdate(req.params.userId, {
    totalBalance: 0,
    todayProfit: 0,
    totalOrders: 0
  });

  res.json({ success: true });
};

/* ======================================================
   🏦 UPDATE DEPOSIT ADDRESS (ADMIN PANEL)
====================================================== */
exports.updateDepositAddress = async (req, res) => {
  const { username, depositAddress } = req.body;

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json({ success: false });
  }

  user.wallet = { address: depositAddress };
  await user.save();

  res.json({ success: true });
};
/* ======================================================
   📜 DEPOSIT HISTORY (APPROVED + REJECTED)
====================================================== */
exports.getDepositHistory = async (req, res) => {
  try {
    const history = await DepositRequest.find({
      status: { $in: ["approved", "rejected"] }
    })
      .populate("user", "nickname phone")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      history
    });
  } catch (err) {
    console.error("getDepositHistory error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load deposit history"
    });
  }
};

/* ======================================================
   📜 WITHDRAW HISTORY (APPROVED + REJECTED)
====================================================== */
exports.getWithdrawHistory = async (req, res) => {
  try {
    const history = await WithdrawRequest.find({
      status: { $in: ["approved", "rejected"] }
    })
      .populate("user", "nickname phone")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      history
    });
  } catch (err) {
    console.error("getWithdrawHistory error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load withdraw history"
    });
  }
};
