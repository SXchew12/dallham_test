const jwt = require("jsonwebtoken");
const { query } = require("../database/dbpromise");

const checkPlan = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user?.plan) {
      return res.json({
        success: false,
        msg: "You dont have a plan please get one",
      });
    }

    req.userPlan = JSON.parse(user?.plan);
    next();
  } catch (err) {
    console.log(err);
    res.json({ msg: "something went wrong", err });
  }
};

const checkImageMaker = async (req, res, next) => {
  try {
    const plan = req.userPlan;
    const inAppChat = parseInt(plan?.image_maker) > 0 ? true : false;

    if (!inAppChat) {
      return res.json({
        msg: "Your plan does not allow you to use this feature.",
        success: false,
      });
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    res.json({ msg: "something went wrong", err });
  }
};

const checkInAppChat = async (req, res, next) => {
  try {
    const plan = req.userPlan;
    const inAppChat = parseInt(plan?.in_app_chat) > 0 ? true : false;

    if (!inAppChat) {
      return res.json({
        msg: "Your plan does not allow you to use this feature.",
        success: false,
      });
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    res.json({ msg: "something went wrong", err });
  }
};

const checkAiSpeech = async (req, res, next) => {
  try {
    const plan = req.userPlan;
    const inAppChat = parseInt(plan?.speech_to_text) > 0 ? true : false;

    if (!inAppChat) {
      return res.json({
        msg: "Your plan does not allow you to use this feature.",
        success: false,
      });
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    res.json({ msg: "something went wrong", err });
  }
};

const checkAiVoice = async (req, res, next) => {
  try {
    const plan = req.userPlan;
    const inAppChat = parseInt(plan?.voice_maker) > 0 ? true : false;

    if (!inAppChat) {
      return res.json({
        msg: "Your plan does not allow you to use this feature.",
        success: false,
      });
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    res.json({ msg: "something went wrong", err });
  }
};

const checkAiVideo = async (req, res, next) => {
  try {
    const plan = req.userPlan;
    const inAppChat = parseInt(plan?.ai_video) > 0 ? true : false;

    if (!inAppChat) {
      return res.json({
        msg: "Your plan does not allow you to use this feature.",
        success: false,
      });
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    res.json({ msg: "something went wrong", err });
  }
};

const checkEmbedBot = async (req, res, next) => {
  try {
    const plan = req.userPlan;
    const inAppChat = parseInt(plan?.code_writer) > 0 ? true : false;

    if (!inAppChat) {
      return res.json({
        msg: "Your plan does not allow you to use this feature.",
        success: false,
      });
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    res.json({ msg: "something went wrong", err });
  }
};

module.exports = {
  checkPlan,
  checkInAppChat,
  checkImageMaker,
  checkAiSpeech,
  checkAiVoice,
  checkAiVideo,
  checkEmbedBot,
};
