const User = require("../models/User");

// ================= ALL USERS =================
exports.getAllUsers = async (req, res) => {

  try {

    const users = await User.find({})
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      users
    });

  } catch (error) {

    console.error(
      "getAllUsers error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// ================= SEARCH USERS =================
exports.searchUsers = async (req, res) => {

  try {

    const query =
      req.query.query || "";

    const regex =
      new RegExp(query, "i");

    const users =
      await User.find({

        $or: [
          { username: regex },
          { nickname: regex },
          { phone: regex },
          { invitationCode: regex }
        ]

      });

    return res.json({
      success: true,
      users
    });

  } catch (error) {

    console.error(
      "searchUsers error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};