const { query } = require("../database/dbpromise");
const fs = require("fs");
const path = require("path");
const { OpenAI } = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fetch = require("node-fetch");
const randomstring = require("randomstring");
const unzipper = require("unzipper");
const nodemailer = require("nodemailer");

function ensureFileWithEmptyArray(filePath) {
  const dir = path.dirname(filePath);

  // Ensure the directory exists
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    // Create the file with an empty JSON array
    fs.writeFileSync(filePath, JSON.stringify([]), "utf8");
    console.log(`File created at ${filePath} with empty array.`);
  } else {
    console.log(`File already exists at ${filePath}.`);
  }
}

function addPriceColor(array, key) {
  return array.map((item) => {
    let price = item[key];
    let priceColor;

    if (price === 10) {
      priceColor = "#EFEFEF";
    } else if (price === 20) {
      priceColor = "#FFD700"; // light golden
    } else if (price >= 30) {
      priceColor = "#FFD700"; // golden
    } else {
      priceColor = "#FFD700"; // golden for 40 and above
    }

    return { ...item, priceColor };
  });
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function addDaysToCurrentTimestamp(days) {
  // Get the current timestamp
  let currentTimestamp = Date.now();

  // Calculate the milliseconds for the given number of days
  let millisecondsToAdd = days * 24 * 60 * 60 * 1000;

  // Add the milliseconds to the current timestamp
  let newTimestamp = currentTimestamp + millisecondsToAdd;

  // Return the new timestamp
  return newTimestamp;
}

// adding in order
async function addOrder({ uid, paymentMode, amount, data }) {
  await query(
    `INSERT INTO orders (uid, payment_mode, amount, data) VALUES (?,?,?,?)`,
    [uid, paymentMode, amount, data]
  );
}

async function updateUserPlan({ uid, planId, trial }) {
  const getPlan = await query(`SELECT * FROM plan WHERE id = ?`, [planId]);
  if (getPlan.length > 0) {
    const plan = getPlan[0];
    const planDuration = parseInt(plan?.days || 0);
    const timeStamp = addDaysToCurrentTimestamp(planDuration);

    await query(
      `UPDATE user SET
      plan = ?,
      plan_expire = ?,
      trial = ?,
      gemini_token = ?,
      openai_token = ?
      WHERE uid = ?`,
      [
        JSON.stringify(plan),
        timeStamp,
        trial ? 1 : 0,
        plan?.gemini_token,
        plan?.openai_token,
        uid,
      ]
    );
    return plan;
  } else {
    return {};
  }
}

function getFileExtension(fileName) {
  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex !== -1 && dotIndex !== 0) {
    const extension = fileName.substring(dotIndex + 1);
    return extension.toLowerCase();
  }
  return "";
}

async function getAllAPIKeys() {
  const res = await query(`SELECT * FROM api_keys`, []);
  if (res?.length > 0) {
    return res[0];
  } else {
    return {};
  }
}

function readJsonFile(filePath, numObjects) {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    const jsonData = JSON.parse(data);

    // Ensure the data is an array
    if (Array.isArray(jsonData)) {
      if (numObjects !== undefined) {
        // Return the latest numObjects items
        return jsonData.slice(-numObjects);
      }
      return jsonData;
    }

    console.error(
      `Invalid JSON format: Expected an array but got ${typeof jsonData}`
    );
    // Create the file with an empty array
    fs.writeFileSync(filePath, JSON.stringify([]), "utf8");
    return [];
  } catch (error) {
    console.error(
      `Error reading or parsing file at ${filePath}:`,
      error.message
    );
    // Create the file with an empty array
    fs.writeFileSync(filePath, JSON.stringify([]), "utf8");
    return [];
  }
}

function deleteFileIfExists(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`File deleted: ${filePath}`);
    } else {
      console.log(`File does not exist: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error deleting file at ${filePath}:`, error.message);
  }
}

function openAiReply({ chat, model }) {
  return new Promise(async (resolve) => {
    try {
      const setChats = chat?.map((i) => {
        return {
          role: i?.sender === "user" ? "user" : "assistant",
          content: i?.text,
        };
      });

      const finalMemory = [
        { role: "system", content: model?.train_data },
        ...setChats,
      ];

      const api = await getAllAPIKeys();

      const openai = new OpenAI({
        apiKey: api?.open_ai,
      });

      const completion = await openai.chat.completions.create({
        messages: finalMemory,
        model: model?.openai_model,
      });

      if (completion.choices?.length > 0) {
        const text = completion.choices[0]?.message?.content;

        resolve({ text: text, tokens: completion?.usage?.total_tokens });
      } else {
        resolve({ text: JSON.stringify(completion) });
      }
    } catch (err) {
      console.log(err);
      resolve({ text: err?.toString() });
    }
  });
}

function geminiAiReply({ chatData, modelData, question }) {
  return new Promise(async (resolve) => {
    try {
      const apiKey = await getAllAPIKeys();

      const genAI = new GoogleGenerativeAI(apiKey?.gemini_ai);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const filterUser = chatData?.filter((i) => i?.sender == "user");
      const filterAssistant = chatData?.filter((i) => i?.sender == "assistant");

      const userArr = filterUser?.map((i) => {
        return {
          text: i?.text,
        };
      });

      const assisArr = filterAssistant?.map((i) => {
        return {
          text: i?.text,
        };
      });

      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [
              {
                text: modelData?.train_data,
              },
              ...userArr,
            ],
          },
          {
            role: "model",
            parts: assisArr?.length > 0 ? assisArr : [{ text: "hi" }],
          },
        ],
      });

      const result = await chat.sendMessage(question);

      resolve({
        text: result?.response?.text(),
        tokens: result?.response?.usageMetadata?.totalTokenCount,
      });
    } catch (err) {
      console.log(err);
      resolve({ text: err?.toString() });
    }
  });
}

function pushToJsonArray(filePath, object) {
  // Ensure the directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Initialize an empty array
  let jsonArray = [];

  // Check if the file exists
  if (fs.existsSync(filePath)) {
    try {
      // Read the file content
      const data = fs.readFileSync(filePath, "utf8");
      // Parse the JSON content
      jsonArray = JSON.parse(data);
      // Ensure it is an array
      if (!Array.isArray(jsonArray)) {
        jsonArray = [];
      }
    } catch (error) {
      // If there's an error (e.g., invalid JSON), reset to an empty array
      jsonArray = [];
    }
  }

  // Push the new object to the array
  jsonArray.push(object);

  // Write the updated array back to the file
  fs.writeFileSync(filePath, JSON.stringify(jsonArray, null, 2), "utf8");
}

async function getReply({
  uid = String,
  chatId = String,
  question = String,
  userData = String,
  embed = false,
  modelId = String,
}) {
  try {
    let user;
    if (userData) {
      user = userData;
    } else {
      const getUser = await query(`SELECT * FROM user WHERE uid = ?`, [uid]);
      if (getUser.length < 1) {
        return { success: false, msg: `Invalid user found: ${uid}` };
      }
      user = getUser[0];
    }

    if (!user?.plan) {
      return { success: false, msg: "User does not have a plan " };
    }

    let chatData;
    if (embed) {
      chatData = await query(`SELECT * FROM embed_chats WHERE chat_id = ?`, [
        chatId,
      ]);
    } else {
      chatData = await query(
        `SELECT * FROM chat WHERE chat_id = ? AND uid = ?`,
        [chatId, uid || user?.uid]
      );
    }

    if (chatData?.length < 1) {
      return { success: false, msg: `Chat id not found: ${chatId}` };
    }

    const chat = embed ? { ...chatData[0], model_id: modelId } : chatData[0];

    // getting model data
    const getModel = await query(
      `SELECT * FROM ai_model WHERE uid = ? AND model_id = ?`,
      [uid || user?.uid, chat?.model_id]
    );

    if (getModel?.length < 1) {
      return { success: false, msg: `Model not found: ${chat?.model_id}` };
    }
    const model = getModel[0];

    const token =
      model?.ai_type === "GEMINI"
        ? parseInt(user?.gemini_token || 0)
        : parseInt(user?.openai_token || 0);

    if (token < 200) {
      return {
        success: false,
        msg: `You need atleast 200 ${model?.ai_type} tokens to use this feature`,
      };
    }

    const memory = parseInt(model?.memory || 1);

    const chatHistoryPath = `${__dirname}/../chats/${
      embed ? "embed" : "inapp"
    }/${uid || user?.uid}/${chatId}.json`;

    const msgHistory = readJsonFile(chatHistoryPath, memory);

    if (model?.ai_type === "GEMINI") {
      const { text, tokens } = await geminiAiReply({
        chatData: msgHistory,
        modelData: model,
        question: question,
      });

      const tookToken = parseInt(tokens) > 0 ? parseInt(tokens) : 0;

      const remainToken = token - tookToken;

      console.log({
        remainToken,
      });

      await query(`UPDATE user SET gemini_token = ? WHERE uid = ?`, [
        parseInt(remainToken) < 0 ? 0 : remainToken,
        uid || user?.uid,
      ]);

      return {
        success: true,
        msg: text,
      };
    } else {
      const { text, tokens } = await openAiReply({
        chat: msgHistory,
        model: model,
      });

      const tookToken = parseInt(tokens) > 0 ? parseInt(tokens) : 0;

      const remainToken = token - tookToken;

      await query(`UPDATE user SET openai_token = ? WHERE uid = ?`, [
        parseInt(remainToken) < 0 ? 0 : remainToken,
        uid || user?.uid,
      ]);

      return {
        success: true,
        msg: text,
      };
    }
  } catch (err) {
    return { success: false, msg: err?.toString() };
  }
}

const resize = (width, height) => {
  if (width > 1024 || height > 1024) {
    if (width > height) {
      height = Math.floor((height * 1024) / width);
      width = 1024;
    } else {
      width = Math.floor((width * 1024) / height);
      height = 1024;
    }
  }
  return { width, height };
};

const countImageTokens = (resolution) => {
  const [width, height] = resolution.split("x").map(Number);
  const { width: resizedWidth, height: resizedHeight } = resize(width, height);
  const h = Math.ceil(resizedHeight / 512);
  const w = Math.ceil(resizedWidth / 512);
  const total = 85 + 170 * h * w;
  return total;
};

const parseResolution = (resolution) => {
  const [width, height] = resolution.split("x").map(Number);
  return { width, height };
};

async function generateImgSd(resolution, prompt, filePath, style) {
  try {
    const api = await getAllAPIKeys();

    const engineId = "stable-diffusion-v1-6";
    const apiHost = "https://api.stability.ai";
    const apiKey = api?.stable_diffusion;

    const response = await fetch(
      `${apiHost}/v1/generation/${engineId}/text-to-image`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: prompt,
            },
          ],
          cfg_scale: 7,
          height: parseResolution(resolution)?.height,
          width: parseResolution(resolution)?.width,
          steps: 30,
          samples: 1,
          style_preset: style,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Non-200 response: ${await response.text()}`);
    }

    const responseJSON = await response.json();
    responseJSON.artifacts.forEach((image, index) => {
      fs.writeFileSync(filePath, Buffer.from(image.base64, "base64"));
    });

    console.log("Images have been saved.");
  } catch (error) {
    throw error;
    console.error("Error generating or saving image:", error);
  }
}

const generateAndSaveImage = async (resolution, prompt, filepath) => {
  try {
    const api = await getAllAPIKeys();

    const openai = new OpenAI({
      apiKey: api?.open_ai,
    });

    const response = await openai.images.generate({
      prompt,
      n: 1,
      size: resolution,
    });

    const imageUrl = response.data[0].url;
    const imageResponse = await fetch(imageUrl);
    const buffer = await imageResponse.buffer();

    fs.writeFile(filepath, buffer, () =>
      console.log("Image saved to", filepath)
    );
  } catch (error) {
    throw error;
    // console.error("Error generating or saving image:", error);
  }
};

function generateAiImage({ aiType, imgSize, imgStyle, prompt, user }) {
  return new Promise(async (resolve) => {
    try {
      // calculation token
      const tokanToBeTaken = countImageTokens(imgSize);

      if (tokanToBeTaken > parseInt(user?.openai_token)) {
        return resolve({
          success: false,
          msg: `You have ${user?.openai_token} left however it requires ${tokanToBeTaken} tokens`,
        });
      }

      const imageName = `${randomstring.generate(4)}.png`;
      const filePath = `${__dirname}/../client/public/media/${imageName}`;

      if (aiType === "SD") {
        await generateImgSd(imgSize, prompt, filePath, imgStyle);
      } else {
        const promptAfter = `${prompt}, in image style: ${imgStyle}`;
        await generateAndSaveImage(imgSize, promptAfter, filePath);
      }

      const tokenFinal =
        parseInt(user?.openai_token) - parseInt(tokanToBeTaken);

      await query(`UPDATE user SET openai_token = ? WHERE uid = ?`, [
        tokenFinal,
        user?.uid,
      ]);

      await query(
        `INSERT INTO ai_image (uid, ai_type, image_size, image_style, prompt, filename) VALUES (?,?,?,?,?,?)`,
        [user?.uid, aiType, imgSize, imgStyle, prompt, imageName]
      );

      resolve({ success: true, msg: "Image generation done!" });
    } catch (err) {
      resolve({ success: false, msg: err?.toString() });
    }
  });
}

function countWordsAndCalculatePrice(text) {
  // Function to count words in the given text
  const countWords = (text) => {
    console.log({ text });
    return text.trim().split(/\s+/).length;
  };

  // Function to calculate the price based on word count
  const calculatePrice = (wordCount) => {
    const pricePer150Words = 0.006;
    const pricePerMillionWords = 5.0;
    const wordsPerMillion = 1000000;
    const wordsPer150 = 100;

    if (wordCount >= wordsPerMillion) {
      return (wordCount / wordsPerMillion) * pricePerMillionWords;
    } else {
      return (wordCount / wordsPer150) * pricePer150Words;
    }
  };

  const wordCount = countWords(text);
  const price = calculatePrice(wordCount);

  return { wordCount, price };
}

function genSpeech({ user, type, filename }) {
  return new Promise(async (resolve) => {
    try {
      const api = await getAllAPIKeys();
      const openai = new OpenAI({
        apiKey: api?.open_ai,
      });

      if (type === "text") {
        const audioPath = `${__dirname}/../client/public/media/${filename}`;
        const transcription = await openai.audio.transcriptions.create({
          file: fs.createReadStream(audioPath),
          model: "whisper-1",
        });

        const text = transcription?.text;
        await query(
          `INSERT INTO ai_speech (uid, type, filename, output) VALUES (?,?,?,?)`,
          [user?.uid, type, filename, text]
        );

        const { wordCount } = countWordsAndCalculatePrice(text);

        const userUpdate = parseInt(user?.openai_token) - parseInt(wordCount);
        await query(`UPDATE user SET openai_token = ? WHERE uid = ?`, [
          userUpdate,
          user?.uid,
        ]);

        deleteFileIfExists(audioPath);

        resolve({ success: true, msg: "Speech was generated" });
      } else {
        const audioPath = `${__dirname}/../client/public/media/${filename}`;
        const transcription = await openai.audio.transcriptions.create({
          file: fs.createReadStream(audioPath),
          model: "whisper-1",
          response_format: "verbose_json",
          timestamp_granularities: ["word"],
        });

        const text = transcription;
        await query(
          `INSERT INTO ai_speech (uid, type, filename, output) VALUES (?,?,?,?)`,
          [user?.uid, type, filename, JSON.stringify(text)]
        );

        const { wordCount } = countWordsAndCalculatePrice(transcription?.text);
        const userUpdate = parseInt(user?.openai_token) - parseInt(wordCount);
        await query(`UPDATE user SET openai_token = ? WHERE uid = ?`, [
          userUpdate,
          user?.uid,
        ]);

        deleteFileIfExists(audioPath);

        resolve({ success: true, msg: "Speech was generated" });
      }
    } catch (err) {
      resolve({ success: false, msg: err?.toString() });
    }
  });
}

function countWordsAndCalculatePriceTTS(text) {
  // Function to count words in the given text
  const countWords = (text) => {
    return text.trim().split(/\s+/).length;
  };

  // Function to calculate the price based on word count
  const calculatePrice = (wordCount) => {
    const pricePer150Words = 0.015;
    const pricePerMillionWords = 5.0;
    const wordsPerMillion = 1000000;
    const wordsPer150 = 1000;

    if (wordCount >= wordsPerMillion) {
      return (wordCount / wordsPerMillion) * pricePerMillionWords;
    } else {
      return (wordCount / wordsPer150) * pricePer150Words;
    }
  };

  const wordCount = countWords(text);
  const price = calculatePrice(wordCount);

  return { wordCount, price };
}

function genVoice({ user, prompt, voice }) {
  return new Promise(async (resolve) => {
    try {
      const api = await getAllAPIKeys();

      const openai = new OpenAI({
        apiKey: api?.open_ai,
      });

      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: voice,
        input: prompt,
      });
      const filename = `${randomstring.generate(4)}.mp3`;
      const speechFile = `${__dirname}/../client/public/speech/${filename}`;
      const buffer = Buffer.from(await mp3.arrayBuffer());
      await fs.promises.writeFile(speechFile, buffer);

      const tokenUpdate =
        parseInt(user?.openai_token) -
        countWordsAndCalculatePriceTTS(prompt).wordCount;

      await query(`UPDATE user SET openai_token = ? WHERE uid = ?`, [
        tokenUpdate,
        user.uid,
      ]);

      await query(
        `INSERT INTO ai_voice (uid, prompt, voice, filename) VALUES (?,?,?,?)`,
        [user?.uid, prompt, voice, filename]
      );

      resolve({ success: true, msg: "Ai voice was generated" });
    } catch (err) {
      console.log(err);
      resolve({ success: false, msg: err?.toString() });
    }
  });
}

function replaceKeywordInFile(filePath, keyword, newKeyword, outputFilePath) {
  // Read the content of the file
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading the file: ${err}`);
      return;
    }

    // Replace the keyword with the new keyword
    const updatedContent = data.replace(new RegExp(keyword, "g"), newKeyword);

    // Write the updated content to a new file
    fs.writeFile(outputFilePath, updatedContent, "utf8", (err) => {
      if (err) {
        console.error(`Error writing the file: ${err}`);
        return;
      }
      console.log(`File has been saved as ${outputFilePath}`);
    });
  });
}

function hexToASSColor(hex) {
  // Remove the hash at the start if it's there
  hex = hex.replace(/^#/, "");

  // Parse the hex color to RGB
  let r, g, b;

  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    throw new Error("Invalid HEX color format");
  }

  // Assuming full opacity (alpha = 0)
  const a = 0;

  // Convert the alpha, red, green, and blue values to their hex representations
  // Note: ASS format uses BBGGRR order
  const argb = `&H${a.toString(16).padStart(2, "0").toUpperCase()}${b
    .toString(16)
    .padStart(2, "0")
    .toUpperCase()}${g.toString(16).padStart(2, "0").toUpperCase()}${r
    .toString(16)
    .padStart(2, "0")
    .toUpperCase()}`;

  return argb;
}

const effectArr = [
  {
    name: "Blur",
    code: "{\\blur5\\3c&HFFC000}",
  },
  {
    name: "Blur T",
    code: "{\\blur5\\3c&HFFC000&\\t(\\3c&HFF00C5&)}",
  },
  {
    name: "One C",
    code: "{\\1c&HFF0000&\\t(\\1c&H0000FF&)}",
  },
  {
    name: "Fscy",
    code: "{\\fscx0\\fscy0\\t(0,100,\\fscx100\\fscy100)}",
  },
  {
    name: "Clip",
    code: "{\\clip()\\b1\\fs50.5\\move(899,300,899,339,28,9245)\\frz4.3\\fax0.175\\c&H6054FF&\\blur1.6}",
  },
  {
    name: "Move",
    code: "{\\move(960,1080,960,540)}",
  },
  {
    name: "Tf",
    code: "{\\t(0,500,1,\\frx360)}",
  },
  {
    name: "4Ch",
    code: "{\\4c&H000000&}",
  },
];

function getFileSizeInMB(filePath) {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        return reject(`Error retrieving file size: ${err.message}`);
      }
      const fileSizeInMB = stats.size / (1024 * 1024);
      resolve(fileSizeInMB);
    });
  });
}

async function saveImages(urlArray, resolution, savePath) {
  const savedNames = [];
  let totalTokens = 0;

  // Ensure the save path exists
  if (!fs.existsSync(savePath)) {
    fs.mkdirSync(savePath, { recursive: true });
  }

  // Function to save a single image
  const saveImage = async (url) => {
    try {
      const imageResponse = await fetch(url);
      const buffer = await imageResponse.buffer();
      const fileName = `${randomstring.generate(7)}.jpg`; // Generate a random file name
      const filePath = path.join(savePath, fileName);

      // Save the image to the specified path
      fs.writeFileSync(filePath, buffer);

      // Calculate the tokens for this image
      const tokens = countImageTokens(resolution);

      return { fileName, tokens };
    } catch (error) {
      console.error(`Error saving image from ${url}:`, error.message);
      return { fileName: null, tokens: 0 };
    }
  };

  // Save all images and collect their file names and token counts
  for (let i = 0; i < urlArray.length; i++) {
    const url = urlArray[i];
    const { fileName, tokens } = await saveImage(url);

    if (fileName) {
      savedNames.push(fileName);
      totalTokens += tokens;
    }
  }

  return { savedNames, totalTokens };
}

function genrateImageFromTex(text, numOfImg, resolution) {
  return new Promise(async (resolve, reject) => {
    try {
      const apiKey = await getAllAPIKeys();

      const openai = new OpenAI({
        apiKey: apiKey?.open_ai,
      });

      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "user",
            content: `i want to create image of thing related to this (${
              text?.length > 2000 ? text?.slice(0, 2000) : text
            }) give me prompt to create things related in 100 characters`,
          },
        ],
        model: "gpt-4o",
      });

      if (completion.choices?.length > 0) {
        const text = completion.choices[0]?.message?.content;
        const tokens = completion?.usage?.total_tokens;

        console.log({ textForImg: text });

        const response = await openai.images.generate({
          prompt:
            text?.length > 120 ? text?.slice(0, 100) : `${text} in realastic`,
          n: numOfImg < 10 ? numOfImg : 10,
          size: resolution,
          model: "dall-e-2",
        });

        if (response?.data?.length > 0) {
          const tempPath = `${__dirname}/../itv/temp`;
          const urlArr = response?.data?.map((i) => i.url);

          const { savedNames, totalTokens } = await saveImages(
            urlArr,
            resolution,
            tempPath
          );

          resolve({ savedNames, totalTokens: totalTokens + tokens });
        } else {
          reject(JSON.stringify(response));
        }
      } else {
        reject(JSON.stringify(completion));
      }
    } catch (err) {
      reject(err);
    }
  });
}

function returnOpenText(question, user) {
  return new Promise(async (resolve) => {
    try {
      const api = await getAllAPIKeys();
      const openai = new OpenAI({
        apiKey: api?.open_ai,
      });

      const finalMemory = [{ role: "system", content: question }];
      const completion = await openai.chat.completions.create({
        messages: finalMemory,
        model: "gpt-4",
      });

      if (completion.choices?.length > 0) {
        const text = completion.choices[0]?.message?.content;

        const finalToken =
          parseInt(user?.openai_token) - completion?.usage?.total_tokens;

        await query(`UPDATE user SET openai_token = ? WHERE uid = ?`, [
          finalToken,
          user?.uid,
        ]);

        resolve({
          text: text,
          tokens: completion?.usage?.total_tokens,
          success: true,
        });
      } else {
        resolve({ success: false, msg: JSON.stringify(completion) });
      }
    } catch (err) {
      console.log(err);
      resolve({ success: false, err: err?.toString() });
    }
  });
}

function sendEmail(host, port, email, pass, html, subject, from, to) {
  return new Promise(async (resolve) => {
    try {
      let transporter = nodemailer.createTransport({
        host: host,
        port: port,
        secure: port === "465" ? true : false, // true for 465, false for other ports
        auth: {
          user: email, // generated ethereal user
          pass: pass, // generated ethereal password
        },
      });

      let info = await transporter.sendMail({
        from: `${from || "Email From"} <${email}>`, // sender address
        to: to, // list of receivers
        subject: subject || "Email", // Subject line
        html: html, // html body
      });

      resolve({ success: true, info });
    } catch (err) {
      resolve({ success: false, err: err.toString() || "Invalid Email" });
    }
  });
}

function folderExists(folderPath) {
  try {
    // Check if the folder exists/Users/hamidsaifi/Desktop/projects/wa-crm-doc/client/public/logo192.png /Users/hamidsaifi/Desktop/projects/wa-crm-doc/client/public/logo512.png
    fs.accessSync(folderPath, fs.constants.F_OK);
    return true;
  } catch (error) {
    // Folder does not exist or inaccessible
    return false;
  }
}

async function downloadAndExtractFile(filesObject, outputFolderPath) {
  try {
    // Access the uploaded file from req.files
    const uploadedFile = filesObject.file;
    if (!uploadedFile) {
      return { success: false, msg: "No file data found in FormData" };
    }

    // Create a writable stream to save the file
    const outputPath = path.join(outputFolderPath, uploadedFile.name);

    // Move the file to the desired location
    await new Promise((resolve, reject) => {
      uploadedFile.mv(outputPath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    // Extract the downloaded file
    await fs
      .createReadStream(outputPath)
      .pipe(unzipper.Extract({ path: outputFolderPath })) // Specify the output folder path for extraction
      .promise();

    // Delete the downloaded zip file after extraction
    fs.unlinkSync(outputPath);

    return { success: true, msg: "App was successfully installed/updated" };
  } catch (error) {
    console.error("Error downloading and extracting file:", error);
    return { success: false, msg: error.message };
  }
}

const getUploadPath = () => {
    return process.env.NODE_ENV === 'production'
        ? '/tmp'  // Vercel temporary directory
        : path.join(__dirname, '../client/public/media');
};

module.exports = {
  addPriceColor,
  isValidEmail,
  updateUserPlan,
  addOrder,
  getFileExtension,
  ensureFileWithEmptyArray,
  getAllAPIKeys,
  readJsonFile,
  deleteFileIfExists,
  getReply,
  pushToJsonArray,
  generateAiImage,
  genSpeech,
  genVoice,
  replaceKeywordInFile,
  countWordsAndCalculatePrice,
  hexToASSColor,
  effectArr,
  getFileSizeInMB,
  genrateImageFromTex,
  parseResolution,
  countWordsAndCalculatePriceTTS,
  returnOpenText,
  sendEmail,
  folderExists,
  downloadAndExtractFile,
  getUploadPath,
};
