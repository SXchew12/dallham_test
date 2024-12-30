const router = require("express").Router();
const { query } = require("../database/dbpromise.js");
const bcrypt = require("bcryptjs");
const { sign } = require("jsonwebtoken");
const {
  isValidEmail,
  generateAiImage,
  deleteFileIfExists,
  genSpeech,
  genVoice,
  getAllAPIKeys,
  returnOpenText,
  ensureFileWithEmptyArray,
  readJsonFile,
  pushToJsonArray,
  getReply,
} = require("../functions/function.js");
const randomstring = require("randomstring");
const validateUser = require("../middlewares/user.js");
const {
  checkPlan,
  checkImageMaker,
  checkAiSpeech,
  checkAiVoice,
  checkEmbedBot,
} = require("../middlewares/plan.js");

// adding one bot
router.post(
  "/add_bot",
  validateUser,
  checkPlan,
  checkEmbedBot,
  async (req, res) => {
    try {
      const { modelId } = req.body;

      if (!modelId) {
        return res.json({ msg: "Please select an ai model" });
      }

      const botId = randomstring.generate(5);
      await query(
        `INSERT INTO embed_chatbot (uid, model_id, bot_id	) VALUES (?,?,?)`,
        [req.decode.uid, modelId, botId]
      );

      res.json({
        success: true,
        msg: "The embed was added you can copy the link of the chatbot.",
      });
    } catch (err) {
      console.log(err);
      res.json({
        success: false,
        msg: "something went wrong",
        err,
      });
    }
  }
);

// get my all embed
router.get("/get_my_embed", validateUser, checkPlan, async (req, res) => {
  try {
    const data = await query(`SELECT * FROM embed_chatbot WHERE uid = ?`, [
      req.decode.uid,
    ]);

    res.json({ data, success: true });
  } catch (err) {
    console.log(err);
    res.json({
      success: false,
      msg: "something went wrong",
      err,
    });
  }
});

// Start chat
router.post("/start_chat", async (req, res) => {
  try {
    const { chatId, botId, name, email, mobile } = req.body;

    console.log({
      chatId,
      botId,
      name,
      email,
      mobile,
    });

    if (!botId || !name || !email || !mobile) {
      return res.json({
        msg: "Please provide all required details.",
      });
    }

    // Get chat bot by ID
    const chatBot = await query(
      `SELECT * FROM embed_chatbot WHERE bot_id = ?`,
      [botId]
    );
    if (chatBot.length < 1) {
      return res.json({
        msg: "Invalid bot ID.",
      });
    }

    // Get user associated with chat bot
    const user = await query(`SELECT * FROM user WHERE uid = ?`, [
      chatBot[0].uid,
    ]);
    if (user.length < 1) {
      return res.json({
        msg: "Chat owner not found.",
      });
    }

    const userPlan = JSON.parse(user[0].plan || "{}");

    if (!userPlan.code_writer || parseInt(userPlan.code_writer) < 1) {
      return res.json({
        msg: "Chat owner's plan does not allow this feature.",
      });
    }

    let responseChat;
    let filePath;
    let chats = [];

    if (chatId && chatId !== "null") {
      if (chatId.length > 10) {
        return res.json({
          msg: "Invalid chat ID. Please refresh.",
          refresh: true,
        });
      }

      // Check if chat exists
      const getChat = await query(
        `SELECT * FROM embed_chats WHERE chat_id = ?`,
        [chatId]
      );

      if (getChat.length < 1) {
        // Chat does not exist, create new entry
        await query(
          `INSERT INTO embed_chats (bot_id, user_email, user_mobile, user_name, chat_id) VALUES (?,?,?,?,?)`,
          [botId, email, mobile, name, chatId]
        );
      } else {
        responseChat = getChat[0];
      }
    } else {
      // Create new chat ID
      const chatIdNew = randomstring.generate(4);
      filePath = `${__dirname}/../chats/embed/${user[0].uid}/${chatIdNew}.json`;
      ensureFileWithEmptyArray(filePath);

      await query(
        `INSERT INTO embed_chats (bot_id, user_email, user_mobile, user_name, chat_id) VALUES (?,?,?,?,?)`,
        [botId, email, mobile, name, chatIdNew]
      );

      const getChat = await query(
        `SELECT * FROM embed_chats WHERE chat_id = ?`,
        [chatIdNew]
      );
      responseChat = getChat[0];
    }

    // Read chat messages from file
    if (!filePath) {
      filePath = `${__dirname}/../chats/embed/${user[0].uid}/${chatId}.json`;
    }
    chats = readJsonFile(filePath);

    res.json({
      success: true,
      chat: responseChat,
      msgArr: chats,
    });
  } catch (err) {
    console.log(err);
    res.json({
      success: false,
      msg: "Something went wrong.",
      err,
    });
  }
});

// get reply
router.post("/get_reply", async (req, res) => {
  try {
    const { chatId, question } = req.body;

    console.log({
      chatId,
      question,
    });

    if (!question) {
      return res.json({ msg: "You forgot to type a message" });
    }

    const getChat = await query(`SELECT * FROM embed_chats WHERE chat_id = ?`, [
      chatId,
    ]);

    if (getChat?.length < 1) {
      return res.json({ msg: "Invalid chat ID found" });
    }

    const getChatBot = await query(
      `SELECT * FROM embed_chatbot WHERE bot_id = ?`,
      [getChat[0]?.bot_id]
    );

    if (getChatBot?.length < 1) {
      return res.json({
        msg: "It seems that chat link is no longer exist",
      });
    }

    const user = await query(`SELECT * FROM user WHERE uid = ?`, [
      getChatBot[0]?.uid,
    ]);

    if (user?.length < 1 || !user[0]?.plan) {
      return res.json({
        msg: "Either chat owner does not exist or the user does not have a plan",
      });
    }

    const getModel = await query(`SELECT * FROM ai_model WHERE id = ?`, [
      getChatBot[0]?.model_id,
    ]);

    if (getModel?.length < 1) {
      return res.json({ msg: "It seems chat ai model does not exist" });
    }

    const userData = user[0];
    const userPlan = JSON.parse(user[0]?.plan);
    const chatBot = getChatBot[0];
    const chatMysql = getChat[0];
    const modelData = getModel[0];

    const dateNow = Date.now() / 1000;

    const newMsg = {
      msgType: "text",
      sender: "user",
      modelId: modelData?.model_id,
      text: question,
      msgObj: {
        text: question,
      },
      uid: userData?.uid,
      timestamp: dateNow,
    };

    const chatFilePath = `${__dirname}/../chats/embed/${userData?.uid}/${chatMysql?.chat_id}.json`;
    // adding new messge to json
    pushToJsonArray(chatFilePath, newMsg);

    const replyMsg = await getReply({
      uid: userData?.uid,
      chatId: chatMysql?.chat_id,
      question: question,
      userData: userData,
      embed: true,
      modelId: modelData?.model_id,
    });

    const dateNowNew = Date.now() / 1000;
    const aiMsg = {
      msgType: "text",
      sender: "assistant",
      modelId: modelData?.model_id,
      text: replyMsg?.msg,
      msgObj: {
        text: replyMsg?.msg,
      },
      uid: userData?.uid,
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
    res.json({
      success: false,
      msg: "something went wrong",
      err,
    });
  }
});

// delete a chatbot
router.post("/del_chatbot", validateUser, async (req, res) => {
  try {
    const { id } = req.body;

    const getChatBot = await query(`SELECT * FROM embed_chatbot WHERE id = ?`, [
      id,
    ]);

    if (getChatBot.length < 1) {
      return res.json({ msg: "Invalid id provided" });
    }

    await query(`DELETE FROM embed_chatbot WHERE id = ?`, [id]);

    // getting chats

    const chatsData = await query(
      `SELECT * FROM embed_chats WHERE bot_id = ?`,
      [getChatBot[0]?.bot_id]
    );

    const promise = chatsData.map((i) => {
      const chatPath = `${__dirname}/../chats/embed/${req.decode.uid}/${i?.chat_id}.json`;
      deleteFileIfExists(chatPath);
    });

    await Promise.all(promise);

    res.json({ msg: "Chat bot and chats are deleted", success: true });
  } catch (err) {
    console.log(err);
    res.json({
      success: false,
      msg: "something went wrong",
      err,
    });
  }
});

// get initiated chats
router.post(
  "/get_initiated_chats",
  validateUser,
  checkPlan,
  async (req, res) => {
    try {
      const { botId } = req.body;

      const data = await query(`SELECT * FROM embed_chats WHERE bot_id = ?`, [
        botId,
      ]);

      res.json({ data, success: true });
    } catch (err) {
      console.log(err);
      res.json({
        success: false,
        msg: "something went wrong",
        err,
      });
    }
  }
);

// get one chat
router.post("/get_one_chat", validateUser, checkPlan, async (req, res) => {
  try {
    const { chatId } = req.body;

    if (!chatId) return res.json({ msg: "Please provide chatid" });

    const filePath = `${__dirname}/../chats/embed/${req.decode.uid}/${chatId}.json`;
    const data = readJsonFile(filePath);

    res.json({ data, success: true });
  } catch (err) {
    console.log(err);
    res.json({
      success: false,
      msg: "something went wrong",
      err,
    });
  }
});

// del a embed chat
router.post("/del_embed_chat", validateUser, checkPlan, async (req, res) => {
  try {
    const { chatId } = req.body;

    await query(`DELETE FROM embed_chats WHERE chat_id = ?`, [chatId]);

    const filePath = `${__dirname}/../chats/embed/${req.decode.uid}/${chatId}.json`;
    deleteFileIfExists(filePath);

    res.json({ msg: "Chat was deleted", success: true });
  } catch (err) {
    console.log(err);
    res.json({
      success: false,
      msg: "something went wrong",
      err,
    });
  }
});

module.exports = router;
