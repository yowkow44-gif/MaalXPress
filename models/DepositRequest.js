// /backend/models/DepositRequest.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const DepositRequestSchema = new Schema(
  {
    // User who made the deposit
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Deposit amount (USDT)
    amount: {
      type: Number,
      required: true,
      min: 20
    },

    // Blockchain network (fixed in UI)
    network: {
      type: String,
      default: "TRC20"
    },

    // Wallet address shown in deposit.tsx
    walletAddress: {
      type: String,
      required: true
    },

    // User invitation code
    invitationCode: {
      type: String,
      required: true
    },

    // Deposit status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("DepositRequest", DepositRequestSchema);
