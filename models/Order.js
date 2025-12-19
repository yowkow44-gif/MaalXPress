// backend/models/Order.js
const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    platform: { type: String, enum: ["amazon","alibaba","aliexpress"], required: true },

    // orderType: single -> use `image` OR combine -> use `images` array
    orderType: { type: String, enum: ["single","combine"], default: "single" },

    title: { type: String, required: true },
    amount: { type: Number, required: true },       // required payment amount for the order
    commission: { type: Number, default: 0 },       // commission paid to user
    totalProfit: { type: Number, default: 0 },      // commission or final profit for convenience
    orderIndex: { type: Number, required: true },

    // single image filename (if orderType === "single")
    image: { type: String, default: "" },

    // multiple images (if orderType === "combine")
    images: [{ type: String }],                    

    // Optional: restrict this order to a specific invitationCode (string),
    // if empty/null => visible to everyone
    invitationCode: { type: String, default: null },

    status: { type: String, enum: ["active","archived"], default: "active" },

    // who completed this order (user id) - null until completed
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
