const csv = require("csvtojson");
const Order = require("../models/Order");
const User = require("../models/User");

exports.uploadCsvController = async (req, res) => {
  try {
    const { nickname } = req.body;

    if (!nickname || nickname.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Nickname is required"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "CSV file missing"
      });
    }

    // 🔥 FIND USER BY NICKNAME
    const user = await User.findOne({ nickname: nickname.trim() });
    if (!user || !user.invitationCode) {
      return res.status(404).json({
        success: false,
        message: "User not found or invitation code missing"
      });
    }

    const invitationCode = user.invitationCode;

    const rows = await csv().fromFile(req.file.path);
    if (!rows.length) {
      return res.status(400).json({
        success: false,
        message: "CSV is empty"
      });
    }

    const platform = rows[0].platform;
    if (!platform) {
      return res.status(400).json({
        success: false,
        message: "Platform missing in CSV"
      });
    }

    // 🔢 ORDER INDEX (SAME AS SINGLE / COMBINE)
    const lastOrder = await Order.findOne({
      platform,
      invitationCode
    }).sort({ orderIndex: -1 });

    let orderIndex = lastOrder ? lastOrder.orderIndex + 1 : 1;

    for (const row of rows) {
      await Order.create({
        platform: row.platform,
        title: row.title,
        amount: Number(row.amount),
        commission: Number(row.commission || 0),
        totalProfit: Number(row.totalProfit || row.commission || 0),
        orderType: row.orderType || "single",

        image: row.image || "",
        images: row.images
          ? row.images.split(",").map(i => i.trim()).filter(Boolean)
          : [],

        // 🔥 IMPORTANT
        invitationCode,
        orderIndex: orderIndex++,
        status: "active"
      });
    }

    return res.json({
      success: true,
      message: "CSV orders uploaded successfully"
    });

  } catch (err) {
    console.error("CSV upload error:", err);
    return res.status(500).json({
      success: false,
      message: "CSV upload failed"
    });
  }
};
