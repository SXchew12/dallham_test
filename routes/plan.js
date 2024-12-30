const router = require("express").Router();
const { query } = require("../database/dbpromise.js");
const randomString = require("randomstring");
const { sign } = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const adminValidator = require("../middlewares/admin.js");
const validateUser = require("../middlewares/user.js");

router.post("/add_new", adminValidator, async (req, res) => {
  try {
    const {
      name,
      price,
      in_app_chat,
      image_maker,
      code_writer,
      speech_to_text,
      voice_maker,
      ai_video,
      gemini_token,
      openai_token,
      validity_days,
      isTrial,
    } = req.body;

    if (!name || !price || !validity_days) {
      return res.json({
        msg: "Please fill the details",
        success: false,
      });
    }

    await query(
      `INSERT INTO plan (
        name,
        price,
        in_app_chat,
        image_maker,
        code_writer,
        speech_to_text,
        voice_maker,
        ai_video,
        validity_days,
        gemini_token,
        openai_token
        ) VALUES ( ?,?,?,?,?,?,?,?,?,?,?)`,
      [
        name,
        isTrial ? 0 : price,
        in_app_chat ? 1 : 0,
        image_maker ? 1 : 0,
        image_maker ? 1 : 0,
        speech_to_text ? 1 : 0,
        voice_maker ? 1 : 0,
        ai_video ? 1 : 0,
        parseInt(validity_days) > 1 ? parseInt(validity_days) : 0,
        parseInt(gemini_token) > 1 ? parseInt(gemini_token) : 0,
        parseInt(openai_token) > 1 ? parseInt(openai_token) : 0,
      ]
    );

    res.json({
      success: true,
      msg: "Plan was added",
    });
  } catch (err) {
    res.json({
      err,
      msg: "Something went wrong",
      success: false,
    });
  }
});

module.exports = router;
