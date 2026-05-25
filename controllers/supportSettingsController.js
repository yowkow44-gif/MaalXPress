const SupportSettings =
require("../models/SupportSettings");

// ================= GET =================
exports.getSupportSettings =
async (req, res) => {

  try {

    let settings =
      await SupportSettings.findOne();

    if (!settings) {

      settings =
        await SupportSettings.create({
          telegramUsername: "",
          telegramLink: ""
        });
    }

    return res.json({
      success: true,
      settings
    });

  } catch (error) {

    console.error(
      "getSupportSettings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// ================= UPDATE =================
exports.updateSupportSettings =
async (req, res) => {

  try {

    const {
      telegramUsername,
      telegramLink,
      supportTitle,
      supportDescription,
      supportButtonText
    } = req.body;

    let settings =
      await SupportSettings.findOne();

    if (!settings) {

      settings =
        new SupportSettings();
    }

    settings.telegramUsername =
      telegramUsername;

    settings.telegramLink =
      telegramLink;

    settings.supportTitle =
      supportTitle;

    settings.supportDescription =
      supportDescription;

    settings.supportButtonText =
      supportButtonText;

    await settings.save();

    return res.json({
      success: true,
      settings
    });

  } catch (error) {

    console.error(
      "updateSupportSettings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};