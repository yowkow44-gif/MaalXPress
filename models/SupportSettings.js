const mongoose = require("mongoose");

const SupportSettingsSchema = new mongoose.Schema(
  {
    telegramLink: {
      type: String,
      default: "https://t.me/LiveSupport_CS"
    },

    telegramUsername: {
      type: String,
      default: "@LiveSupport_CS"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "SupportSettings",
  SupportSettingsSchema
);