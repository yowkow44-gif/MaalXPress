const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    /* =========================================
       ✅ EXISTING LOGIC (UNCHANGED BEHAVIOR)
    ========================================= */
    if (req.user && req.user.role === "admin") {
      return next();
    }

    /* =========================================
       🆕 FALLBACK: TOKEN SE ADMIN VERIFY
    ========================================= */
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(403).json({ message: "Admin access only" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    // req.user set kar do taaki aage reuse ho sake
    req.user = user;
    next();

  } catch (err) {
    return res.status(403).json({ message: "Admin access only" });
  }
};
