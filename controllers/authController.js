const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ==========================
//        SIGNUP
// ==========================
exports.signup = async (req, res) => {
  try {
    const { username, phoneNumber, password, invitationCode } = req.body;

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

    // ✅ Invitation Code Unique Check
    const inviteExists = await User.findOne({ invitationCode });
    if (inviteExists) {
      return res.status(400).json({
        success: false,
        message: "Invitation code already used"
      });
    }

    // ✅ Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create User
    const newUser = await User.create({
      username: username,          // ✅ ADD THIS LINE
      nickname: username,          // ✅ map username → nickname
      phone: phoneNumber,          // ✅ map phoneNumber → phone
      loginPassword: hashedPassword,
      invitationCode
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      userId: newUser._id
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

    const isMatch = await bcrypt.compare(password, user.loginPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password"
      });
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
        balance: user.balance || 0,
        totalBalance: user.totalBalance || 0,
        todayProfit: user.todayProfit || 0,
        currentOrders: user.currentOrders || 0,
        totalOrders: user.totalOrders || 0,
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
