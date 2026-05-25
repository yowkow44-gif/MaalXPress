const SupportSettings = require("../models/SupportSettings");

// ======================================
// GET SUPPORT SETTINGS
// ======================================
exports.getSupportSettings = async (req, res) => {
  try {

    let settings = await SupportSettings.findOne();

    // Create default if not exists
    if (!settings) {
      settings = await SupportSettings.create({});
    }

    res.json({
      success: true,
      settings
    });

  } catch (error) {
    console.error("Get support settings error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ======================================
// UPDATE SUPPORT SETTINGS
// ======================================
exports.updateSupportSettings = async (req, res) => {
  try {

    const {
      telegramLink,
      telegramUsername
    } = req.body;

    let settings = await SupportSettings.findOne();

    // Create if missing
    if (!settings) {
      settings = await SupportSettings.create({});
    }

    // Update values
    settings.telegramLink =
      telegramLink || settings.telegramLink;

    settings.telegramUsername =
      telegramUsername || settings.telegramUsername;

    await settings.save();

    res.json({
      success: true,
      message: "Support settings updated successfully",
      settings
    });

  } catch (error) {
    console.error("Update support settings error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};