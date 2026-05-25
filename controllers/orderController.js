const Order = require("../models/Order");
const User = require("../models/User");

// Helper
const buildFileUrl = (req, filename) => {
  if (!filename) return "";

  return `${req.protocol}://${req.get("host")}/uploads/orders/${filename}`;
};

/* ======================================================
   ADMIN: CREATE ORDER (SINGLE / COMBINE)
   Admin sends: nickname
   Backend resolves: userId
====================================================== */
exports.createOrder = async (req, res) => {
  try {

    const {
      platform,
      title,
      amount,
      commission,
      totalProfit,
      orderType,
      nickname
    } = req.body;

    if (!platform || !title || !amount || !nickname) {
      return res.status(400).json({
        success: false,
        message: "platform, title, amount and nickname are required"
      });
    }

    // 🔥 Find user by nickname
    const user = await User.findOne({
      nickname: nickname.trim()
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // 🔥 NEW MAIN SYSTEM
    const assignedTo = user._id;

    let image = "";
    let images = [];

    // SINGLE
    if (orderType === "single") {

      if (req.file) {
        image = req.file.filename;
      } else {
        image = req.body.image || "";
      }
    }

    // COMBINE
    if (orderType === "combine") {

      if (req.files && req.files.length > 0) {
        images = req.files.map(f => f.filename);
      }
    }

    // 🔥 ORDER INDEX PER USER + PLATFORM
    const lastOrder = await Order.findOne({
      platform,
      assignedTo
    }).sort({ orderIndex: -1 });

    const nextIndex =
      lastOrder ? lastOrder.orderIndex + 1 : 1;

    // 🔥 CREATE ORDER
    const order = await Order.create({
      platform,
      title,
      orderType,

      amount: Number(amount),

      commission: Number(commission || 0),

      totalProfit: Number(
        totalProfit || commission || 0
      ),

      assignedTo,

      image,
      images,

      orderIndex: nextIndex,

      status: "active",
    });

    const result = order.toObject();

    if (result.image) {
      result.image = buildFileUrl(req, result.image);
    }

    if (result.images?.length) {
      result.images = result.images.map(img =>
        buildFileUrl(req, img)
      );
    }

    return res.json({
      success: true,
      order: result
    });

  } catch (err) {

    console.error("createOrder error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};

/* ======================================================
   USER: GET ORDERS BY PLATFORM
====================================================== */
exports.getOrdersByPlatform = async (req, res) => {
  try {

    const platform = req.params.platform;

    // 🔥 USER ID BASED SYSTEM
    const userId = req.user.id;

    const orders = await Order.find({
      platform,
      status: "active",
      assignedTo: userId,
    })
      .sort({ orderIndex: 1 })
      .lean();

    const mapped = orders.map(o => {

      if (o.image && !o.image.startsWith("http")) {
        o.image = buildFileUrl(req, o.image);
      }

      if (o.images?.length) {

        o.images = o.images.map(img =>
          img.startsWith("http")
            ? img
            : buildFileUrl(req, img)
        );
      }

      return o;
    });

    res.json({
      success: true,
      orders: mapped
    });

  } catch (err) {

    console.error("getOrdersByPlatform error:", err);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};

/* ======================================================
   USER: SUBMIT ORDER
====================================================== */
exports.submitOrder = async (req, res) => {
  try {

    const { orderId } = req.body;

    const user = await User.findById(req.user.id);

    if (!orderId || !user) {
      return res.status(400).json({
        success: false
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // 🔥 USER SECURITY CHECK
    if (
      String(order.assignedTo) !==
      String(user._id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden"
      });
    }

    // 🔥 ARCHIVE ORDER
    order.status = "archived";

    order.user = user._id;

    await order.save();

    // 🔥 COMMISSION
    const commission =
      Number(order.commission || 0);

    user.totalBalance =
      (user.totalBalance || 0) + commission;

    user.todayProfit =
      (user.todayProfit || 0) + commission;

    // 🔥 Completed submitted orders
    user.totalOrders =
      (user.totalOrders || 0) + 1;

    // 🔥 No active order pending now
    user.currentOrders = 0;
    await user.save();

    // 🔥 DELETE COMPLETED ORDER
    await Order.deleteOne({
      _id: orderId,
      user: user._id
    });

    res.json({
      success: true,
      message: "Order completed & deleted after archive",
      balance: user.totalBalance
    });

  } catch (err) {

    console.error("submitOrder error:", err);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};
