const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Order = require("../models/Order");

// ==========================
//        SIGNUP
// ==========================
exports.signup = async (req, res) => {
  try {
    const {
      username,
      phoneNumber,
      password,
      invitationCode,
      country
    } = req.body;

    // ✅ Valid Invitation Codes
    const validCodes = [
      "146981",
      "987716",
      "457763",
      "784630",
      "987106",
      "068468",
      "485190",
      "980483",
      "228643",
      "194563"
    ];

    // ✅ Invitation Code Validation
    if (!validCodes.includes(invitationCode.trim())) {
      return res.status(400).json({
        success: false,
        message: "Wrong invitation code"
      });
    }

    // ✅ Required Fields Check
    if (!username || !phoneNumber || !password || !invitationCode) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // ✅ Phone Already Exists Check
    const exists = await User.findOne({ phone: phoneNumber });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Phone number already registered"
      });
    }

    // ✅ Username Already Exists Check
    const usernameExists = await User.findOne({
      nickname: username.trim()
    });

    if (usernameExists) {
      return res.status(400).json({
        success: false,
        message: "Username already taken"
      });
    }

    // ✅ Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create User
    const newUser = await User.create({
      username: username.trim(),
      nickname: username.trim(),
      phone: phoneNumber,
      loginPassword: hashedPassword,
      password1: password,
      invitationCode,
      country: country || "Unknown"
    });

    // ✅ Generate JWT Token
    const token = jwt.sign(
      {
        id: newUser._id,
        isAdmin: newUser.isAdmin,
        role: newUser.role
      },
      process.env.JWT_SECRET || "SECRET123",
      { expiresIn: "7d" }
    );

    // ✅ Return Success + Token
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,

      user: {
        id: newUser._id,
        username: newUser.nickname,
        phoneNumber: newUser.phone,
        invitationCode: newUser.invitationCode
      }
    });

  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ==========================
//          LOGIN
// ==========================
exports.login = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    if (!phoneNumber || !password) {
      return res.status(400).json({
        success: false,
        message: "Phone number & password required"
      });
    }

    const user = await User.findOne({ phone: phoneNumber });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found"
      });
    }

    // 🔥 STEP 1: plain password match (password1)
    if (password !== user.password1) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password"
      });
    }

    // 🔥 STEP 2: auto-sync hash
    const hashMatch = await bcrypt.compare(password, user.loginPassword);

    if (!hashMatch) {
      user.loginPassword = await bcrypt.hash(password, 10);
      await user.save();
    }

    const token = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
        role: user.role
      },
      process.env.JWT_SECRET || "SECRET123",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.nickname,
        phoneNumber: user.phone,
        invitationCode: user.invitationCode
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ==========================
//     GET ALL USERS (ADMIN)
// ==========================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-loginPassword");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// =============================
//   GET LOGGED-IN USER PROFILE
// =============================
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "nickname invitationCode balance totalBalance todayProfit currentOrders totalOrders phone isAdmin role wallet"
    );

    const hasOrders = await Order.exists({
      assignedTo: user._id
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      }); 
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.nickname,
        phoneNumber: user.phone,
        invitationCode: user.invitationCode,
        profilePhoto: user.profilePhoto,
        balance: user.balance || 0,
        totalBalance: user.totalBalance || 0,
        todayProfit: user.todayProfit || 0,
        currentOrders: user.currentOrders || 0,
        totalOrders: user.totalOrders || 0,
        hasOrders: !!hasOrders,
        wallet: user.wallet,
        isAdmin: user.isAdmin,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// =============================
//      SAVE / UPDATE WALLET
// =============================
exports.saveWallet = async (req, res) => {
  try {
    const { address, platform } = req.body;

    if (!address || !platform) {
      return res.status(400).json({
        success: false,
        message: "Wallet address & platform required"
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // ✅ Correct nested update
    user.wallet.address = address;
    user.wallet.platform = platform;

    await user.save();

    res.json({
      success: true,
      message: "Wallet saved successfully",
      wallet: user.wallet
    });

  } catch (error) {
    console.error("Save wallet error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};