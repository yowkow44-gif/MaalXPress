const DepositRequest = require("../models/DepositRequest");
const User = require("../models/User");

// ==============================
// USER → CREATE DEPOSIT REQUEST
// ==============================
exports.requestDeposit = async (req, res) => {
  try {
    const { amount, network, walletAddress, invitationCode } = req.body;

    if (!amount || amount < 20) {
      return res.status(400).json({
        success: false,
        message: "Minimum deposit amount is 20 USDT"
      });
    }

    if (!walletAddress || !invitationCode) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const deposit = await DepositRequest.create({
      user: req.user.id,
      amount,
      network: network || "TRC20",
      walletAddress,
      invitationCode
    });

    return res.status(201).json({
      success: true,
      message: "Deposit request submitted successfully",
      deposit
    });

  } catch (error) {
    console.error("Deposit request error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ==============================
// ADMIN → GET ALL DEPOSIT REQUESTS
// ==============================
exports.getAllDeposits = async (req, res) => {
  try {
    const deposits = await DepositRequest.find()
      .populate("user", "username invitationCode")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      deposits
    });
  } catch (error) {
    console.error("Get deposits error:", error);
    res.status(500).json({ success: false });
  }
};

// ==============================
// ADMIN → APPROVE DEPOSIT
// ==============================
exports.approveDeposit = async (req, res) => {
  try {
    const deposit = await DepositRequest.findById(req.params.id);
    if (!deposit) {
      return res.status(404).json({ message: "Deposit not found" });
    }

    const user = await User.findById(deposit.user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Balance update
    
    user.totalBalance += deposit.amount;

    await user.save();

    // Mark approved
    deposit.status = "approved";
    await deposit.save();

    return res.json({
      success: true,
      message: "Deposit approved & balance updated"
    });

  } catch (error) {
    console.error("Approve deposit error:", error);
    res.status(500).json({ success: false });
  }
};

// ==============================
// ADMIN → REJECT DEPOSIT
// ==============================
exports.rejectDeposit = async (req, res) => {
  try {
    const deposit = await DepositRequest.findById(req.params.id);
    if (!deposit) {
      return res.status(404).json({ message: "Deposit not found" });
    }

    deposit.status = "rejected";
    await deposit.save();

    res.json({
      success: true,
      message: "Deposit rejected"
    });

  } catch (error) {
    console.error("Reject deposit error:", error);
    res.status(500).json({ success: false });
  }
};

// USER: apna deposit address laane ke liye
exports.getDepositAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || !user.depositWallet?.address) {
      return res.json({
        success: false,
        message: "Deposit address not assigned"
      });
    }

    res.json({
      success: true,
      address: user.depositWallet.address,
      network: user.depositWallet.network
    });

  } catch (err) {
    console.error("getDepositAddress error:", err);
    res.status(500).json({ success: false });
  }
};