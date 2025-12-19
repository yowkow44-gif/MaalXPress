const mongoose = require("mongoose");
const { Schema } = mongoose;


const ServiceOrderSchema = new mongoose.Schema(
  {
    user: { type:Schema.Types.ObjectId, ref: "User", required: true },
    serviceName: String,
    price: Number,
    status: { type: String, default: "pending" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceOrder", ServiceOrderSchema);
