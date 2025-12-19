const mongoose = require("mongoose");
const { Schema } = mongoose;

const WithdrawRequestSchema = new Schema(
  {
    // 🔗 User who requested withdrawal
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 💰 Withdrawal amount
    amount: {
      type: Number,
      required: true,
    },

    // 🏦 Wallet address
    walletAddress: {
      type: String,
      required: true,
    },

    // 🌐 Network (from frontend)
    network: {
      type: String,
      enum: ["BEP20", "TRC20"],
      required: true,
    },

    // 🧾 Invitation code (for admin reference)
    invitationCode: {
      type: String,
    },

    // ⏳ Request status (admin controlled)
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WithdrawRequest", WithdrawRequestSchema);
