const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    referredUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    inviteCode: { type: String },
    reward: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Referral", referralSchema);
