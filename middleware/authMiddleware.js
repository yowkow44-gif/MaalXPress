const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function (req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth) {
      return res.status(401).json({ success: false, message: "No token" });
    }

    const token = auth.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Token missing" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "SECRET123"
    );

    const user = await User.findById(decoded.id).select(
      "_id nickname phone invitationCode balance wallet isAdmin role"
    );

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = {
      id: user._id,
      username: user.nickname,
      phoneNumber: user.phone,
      invitationCode: user.invitationCode,
      balance: user.balance,
      wallet: user.wallet,
      isAdmin: user.isAdmin,
      role: user.role
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again."
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
};
