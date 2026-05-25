// backend/models/Order.js
const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      enum: ["amazon", "alibaba", "aliexpress"],
      required: true
    },

    // orderType: single -> use `image`
    // combine -> use `images`
    orderType: {
      type: String,
      enum: ["single", "combine"],
      default: "single"
    },

    title: {
      type: String,
      required: true
    },

    // required payment amount
    amount: {
      type: Number,
      required: true
    },

    // commission paid to user
    commission: {
      type: Number,
      default: 0
    },

    // convenience total profit
    totalProfit: {
      type: Number,
      default: 0
    },

    // order number per user/platform
    orderIndex: {
      type: Number,
      required: true
    },

    // 🔥 USER ASSIGNMENT (NEW MAIN SYSTEM)
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // single image filename
    image: {
      type: String,
      default: ""
    },

    // multiple images
    images: [
      {
        type: String
      }
    ],

    // old system kept for compatibility
    invitationCode: {
      type: String,
      default: null
    },

    // active / archived
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active"
    },

    // who completed order
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Order", OrderSchema);
