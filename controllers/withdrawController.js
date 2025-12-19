const WithdrawRequest = require("../models/WithdrawRequest");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

/**
 * USER → Create withdraw request
 * Frontend sends:
 * - amount
 * - walletAddress
 * - network
 * - invitationCode
 * - withdrawPassword (LOGIN PASSWORD)
 */
exports.requestWithdraw = async (req, res) => {
  try {
    const {
      amount,
      walletAddress,
      network,
      invitationCode,
      withdrawPassword
    } = req.body;

    const userId = req.user.id;

    // ✅ Basic validation
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid amount" });
    }

    if (!walletAddress || !network) {
      return res
        .status(400)
        .json({ success: false, message: "Wallet details required" });
    }

    if (!withdrawPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Password required" });
    }

    // ✅ Get user
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 🔐 Verify LOGIN password
    const isMatch = await bcrypt.compare(withdrawPassword, user.loginPassword);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }

    // 💰 Balance check
    if (user.totalBalance < Number(amount)) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient balance" });
    }

    // 📝 Create withdraw request (NO PASSWORD STORED)
    const withdrawRequest = await WithdrawRequest.create({
      user: userId,
      amount: Number(amount),
      walletAddress,
      network,
      invitationCode,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Withdrawal request submitted successfully",
      withdraw: withdrawRequest,
    });

  } catch (error) {
    console.error("requestWithdraw error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
};

/**
 * ADMIN → Approve withdraw
 * - Deduct balance
 * - Delete request after approval
 */
exports.approveWithdraw = async (req, res) => {
  try {
    const withdrawRequest = await WithdrawRequest
      .findById(req.params.id)
      .populate("user");

    if (!withdrawRequest) {
      return res.status(404).json({ message: "Withdraw request not found" });
    }

    const user = withdrawRequest.user;

    // Safety check
    if (user.totalBalance < withdrawRequest.amount) {
      return res
        .status(400)
        .json({ message: "Insufficient balance at approval time" });
    }

    // 💸 Deduct balances
    
    user.totalBalance -= withdrawRequest.amount;
    await user.save();

    // 🗑 Remove request after approval
    await WithdrawRequest.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: "Withdraw approved and balance updated",
    });

  } catch (error) {
    console.error("approveWithdraw error:", error);
    return res
      .status(500)
      .json({ message: "Server error" });
  }
};

/**
 * ADMIN → Reject withdraw
 * - Just delete request
 */
exports.rejectWithdraw = async (req, res) => {
  try {
    const withdrawRequest = await WithdrawRequest.findById(req.params.id);

    if (!withdrawRequest) {
      return res.status(404).json({ message: "Withdraw request not found" });
    }

    await WithdrawRequest.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: "Withdraw request rejected and removed",
    });

  } catch (error) {
    console.error("rejectWithdraw error:", error);
    return res
      .status(500)
      .json({ message: "Server error" });
  }
};
