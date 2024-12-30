const router = require("express").Router();
const { query } = require("../database/dbpromise.js");
const bcrypt = require("bcryptjs");
const { sign } = require("jsonwebtoken");
const {
  isValidEmail,
  ensureFileWithEmptyArray,
  readJsonFile,
  deleteFileIfExists,
  getReply,
  pushToJsonArray,
} = require("../functions/function.js");
const randomstring = require("randomstring");
const validateUser = require("../middlewares/user.js");
const { checkPlan, checkInAppChat } = require("../middlewares/plan.js");

router.post(
  "/create_chat",
  validateUser,
  checkPlan,
  checkInAppChat,
  async (req, res) => {
    try {
      const { modelId } = req.body;
      const chatId = randomstring.generate(4);
      const filePath = `${__dirname}/../chats/inapp/${req.decode.uid}/${chatId}.json`;
      ensureFileWithEmptyArray(filePath);

      await query(
        `INSERT INTO chat (uid, chat_id, title, model_id) VALUES (?,?,?,?)`,
        [req.decode.uid, chatId, modelId, modelId]
      );

      const getChat = await query(
        `SELECT * FROM chat WHERE chat_id = ? AND uid = ?`,
        [chatId, req.decode?.uid]
      );

      res.json({
        success: true,
        chat: getChat[0],
      });
    } catch (err) {
      console.log(err);
      res.json({ err, success: false, msg: "Something went wrong" });
    }
  }
);

// get my chats
router.get(
  "/get_my_chats",
  validateUser,
  checkPlan,
  checkInAppChat,
  async (req, res) => {
    try {
      const data = await query(`SELECT * FROM chat WHERE uid = ?`, [
        req.decode.uid,
      ]);
      res.json({
        data,
        success: true,
      });
    } catch (err) {
      console.log(err);
      res.json({ err, success: false, msg: "Something went wrong" });
    }
  }
);

// get one chat
router.post(
  "/get_one_chat",
  validateUser,
  checkPlan,
  checkInAppChat,
  async (req, res) => {
    try {
      const { chatId, modelId } = req.body;
      const { msgNum } = req.query;

      console.log({
        chatId,
      });

      const filePath = `${__dirname}/../chats/inapp/${req.decode.uid}/${chatId}.json`;
      const msgs = readJsonFile(filePath, msgNum || 50);

      const getModel = await query(
        `SELECT * FROM ai_model WHERE model_id = ?`,
        [modelId]
      );

      if (getModel.checkPlan < 1) {
        return res.json({
          msg: "It looks model is missig or deleted for this chat",
          success: false,
        });
      }

      res.json({
        data: msgs,
        model: getModel[0],
        success: true,
      });
    } catch (err) {
      console.log(err);
      res.json({ err, success: false, msg: "Something went wrong" });
    }
  }
);

// del one chat
router.post("/del_one_chat", validateUser, checkPlan, async (req, res) => {
  try {
    const { chatId } = req.body;

    if (!chatId) {
      return res.json({ msg: "ChatId missing" });
    }

    await query(`DELETE FROM chat WHERE chat_id = ?`, [chatId]);
    const filePath = `${__dirname}/../chats/inapp/${req.decode.uid}/${chatId}.json`;
    deleteFileIfExists(filePath);

    res.json({ success: true, msg: "Chat was deleted" });
  } catch (err) {
    console.log(err);
    res.json({ err, success: false, msg: "Something went wrong" });
  }
});

// send msg ai
router.post(
  "/send_msg",
  validateUser,
  checkPlan,
  checkInAppChat,
  async (req, res) => {
    try {
      const { chatId, modelId, question } = req.body;

      if (!chatId || !modelId) {
        return res.json({
          success: false,
          msg: "Invalid request",
        });
      }

      if (!question) {
        return res.json({
          msg: "Please type your message",
        });
      }

      const dateNow = Date.now() / 1000;

      const newMsg = {
        msgType: "text",
        sender: "user",
        modelId: modelId,
        text: question,
        msgObj: {
          text: question,
        },
        uid: req.decode?.uid,
        timestamp: dateNow,
      };

      const chatFilePath = `${__dirname}/../chats/inapp/${req.decode.uid}/${chatId}.json`;
      // adding new messge to json
      pushToJsonArray(chatFilePath, newMsg);

      const replyMsg = await getReply({
        uid: req.decode?.uid,
        chatId: chatId,
        question: question,
        userData: req.user,
      });

      const dateNowNew = Date.now() / 1000;
      const aiMsg = {
        msgType: "text",
        sender: "assistant",
        modelId: modelId,
        text: replyMsg?.msg,
        msgObj: {
          text: replyMsg?.msg,
        },
        uid: req.decode?.uid,
        timestamp: dateNowNew,
      };

      pushToJsonArray(chatFilePath, aiMsg);

      const newMsgArr = [newMsg, aiMsg];

      res.json({
        success: true,
        data: newMsgArr,
      });
    } catch (err) {
      console.log(err);
      res.json({ err, success: false, msg: "Something went wrong" });
    }
  }
);

module.exports = router;
