const router = require("express").Router();
const { query } = require("../database/dbpromise.js");
const bcrypt = require("bcrypt");
const { sign } = require("jsonwebtoken");
const {
  isValidEmail,
  generateAiImage,
  deleteFileIfExists,
  genSpeech,
  genVoice,
  parseResolution,
  hexToASSColor,
} = require("../functions/function.js");
const randomstring = require("randomstring");
const validateUser = require("../middlewares/user.js");
const {
  checkPlan,
  checkImageMaker,
  checkAiSpeech,
  checkAiVoice,
  checkAiVideo,
} = require("../middlewares/plan.js");
const fs = require("fs");
var sub = require("../srt");
const path = require("path");

router.post(
  "/create_video",
  validateUser,
  checkPlan,
  checkAiVideo,
  async (req, res) => {
    try {
      const { state } = req.body;
      await query(`INSERT INTO ai_video (uid, status, state) VALUES (?,?,?)`, [
        req.decode.uid,
        "QUEUE",
        JSON.stringify(state),
      ]);

      res.json({ success: true, msg: "Task was added to queue" });
    } catch (err) {
      console.log(err);
      res.json({ msg: "somehting went wrong", success: false, err });
    }
  }
);

// get my videos
router.get(
  "/get_my_videos",
  validateUser,
  checkPlan,
  checkAiVideo,
  async (req, res) => {
    try {
      const data = await query(`SELECT * FROM ai_video WHERE uid = ?`, [
        req.decode.uid,
      ]);

      res.json({ data, success: true });
    } catch (err) {
      console.log(err);
      res.json({ msg: "somehting went wrong", success: false, err });
    }
  }
);

// add google image
router.post(
  "/add_google_image",
  validateUser,
  checkPlan,
  checkAiVideo,
  async (req, res) => {
    try {
      const { base64Image } = req.body;
      if (!base64Image) {
        return res.status(400).json({ msg: "Missing base64Image" });
      }

      const fileName = `${randomstring.generate(4)}.png`;
      const filePath = path.join(
        __dirname,
        "../client/public/media/",
        fileName
      );

      // Ensure the directory exists
      const dirPath = path.dirname(filePath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      // Remove the base64 prefix from the string if it exists
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      fs.writeFile(filePath, buffer, (err) => {
        if (err) {
          console.error("Error saving image:", err);
          return res
            .status(500)
            .json({ msg: "Error saving image", success: false });
        }
        res.json({ success: true, fileName: fileName, msg: "Image imported" });
      });
    } catch (err) {
      console.error("Server error:", err);
      res
        .status(500)
        .json({ msg: "Something went wrong", success: false, err });
    }
  }
);

// del a video
router.post("/del_video_ai", validateUser, checkPlan, async (req, res) => {
  try {
    const { id } = req.body;

    const [video] = await query(`SELECT * FROM ai_video WHERE id = ?`, [id]);

    const state = JSON.stringify(video?.state);

    const choosedVideo = `${__dirname}/../client/public/media/${state?.choosedVideo}`;
    const choosedAudio = `${__dirname}/../client/public/media/${state?.choosedAudio}`;
    const mainVideo = `${__dirname}/../client/public/media/${video?.video}`;

    deleteFileIfExists(choosedVideo);
    deleteFileIfExists(choosedAudio);
    deleteFileIfExists(mainVideo);

    await query(`DELETE FROM ai_video WHERE id = ? AND uid = ?`, [
      id,
      req.decode.uid,
    ]);

    res.json({ msg: "Video was deleted", success: true });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ msg: "Something went wrong", success: false, err });
  }
});

module.exports = router;
