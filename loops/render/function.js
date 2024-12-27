const { query } = require("../../database/dbpromise");
const { OpenAI } = require("openai");
const {
  getAllAPIKeys,
  countWordsAndCalculatePriceTTS,
  parseResolution,
  countWordsAndCalculatePrice,
  replaceKeywordInFile,
  effectArr,
} = require("../../functions/function");
const randomstring = require("randomstring");
const fs = require("fs");
var sub = require("../../srt");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const { imageToVideo } = require("./show");
const path = require("path");

ffmpeg.setFfmpegPath(ffmpegPath);

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

const captionPosition = (position, x, y, topMargin = 10, bottomMargin = 50) => {
  const horizontalCenter = x / 2; // Centered horizontally based on the video width
  const verticalCenter = y / 2; // Centered vertically based on the video height

  console.log({ x, y });

  switch (position) {
    case "top":
      return `\\an8\\pos(${horizontalCenter},${topMargin})`; // Centered horizontally with top margin
    case "middle":
      return `\\an5\\pos(${horizontalCenter},${verticalCenter})`; // Centered horizontally and vertically
    case "bottom":
      return `\\an2\\pos(${horizontalCenter},${y - bottomMargin})`; // Centered horizontally with bottom margin
    default:
      return `\\an2\\pos(${horizontalCenter},${y - bottomMargin})`; // Default to bottom alignment with margin from the bottom
  }
};

async function createVideoWithAudioAndSubtitles(
  videoPath,
  assSubtitleText,
  outputVideoPath,
  audioPath = null
) {
  return new Promise((resolve, reject) => {
    // Check if subtitle text is provided
    if (!assSubtitleText) {
      return reject(new Error("Subtitle text must be provided"));
    }

    // Create a temporary .ass subtitle file
    const tempAssPath = path.join(__dirname, "temp_subtitle.ass");

    try {
      fs.writeFileSync(tempAssPath, assSubtitleText, "utf8");
    } catch (err) {
      return reject(`Error creating temp subtitle file: ${err.message}`);
    }

    const command = ffmpeg(videoPath).outputOptions([
      "-vf ass=" + tempAssPath,
      "-c:v libx264",
      "-crf 23",
      "-preset fast",
    ]);

    if (audioPath) {
      command.input(audioPath).outputOptions(["-c:a aac", "-b:a 192k"]);
    }

    command
      .on("end", () => {
        fs.unlink(tempAssPath, (err) => {
          if (err) {
            console.error("Error deleting temp subtitle file:", err);
          }
        });
        resolve();
      })
      .on("error", (err) => {
        fs.unlink(tempAssPath, (unlinkErr) => {
          if (unlinkErr) {
            console.error("Error deleting temp subtitle file:", unlinkErr);
          }
        });
        reject(`Error creating video: ${err.message}`);
      })
      .save(outputVideoPath);
  });
}

function getVideoResolution(videoPath) {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        throw new Error(`Error retrieving video metadata: ${err.message}`);
      }
      const videoStream = metadata.streams.find(
        (stream) => stream.codec_type === "video"
      );
      if (videoStream && videoStream.width && videoStream.height) {
        console.log({
          xxxx: videoStream.width,
          yyyy: videoStream.height,
        });
        resolve({ x: videoStream.width, y: videoStream.height });
      } else {
        throw new Error("Resolution information not available.");
      }
    });
  });
}

async function readAssFile(assFilePath) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const assData = await fs.promises.readFile(assFilePath, "utf8");
    return assData;
  } catch (err) {
    throw new Error(
      `Error reading ASS file at ${assFilePath} - ${err.message}`
    );
  }
}

function convertVideoToMp3(videoPath, outputPath) {
  return new Promise((resolve) => {
    ffmpeg(videoPath)
      .toFormat("mp3")
      .on("end", () => {
        fs.stat(outputPath, (err, stats) => {
          if (err) {
            throw new Error(`Error checking file size: ${err.message}`);
          }
          const fileSizeInMB = stats.size / (1024 * 1024);
          if (fileSizeInMB > 24) {
            fs.unlink(outputPath, (unlinkErr) => {
              if (unlinkErr) {
                throw new Error(
                  `Error deleting large file: ${unlinkErr.message}`
                );
              }
              throw new Error(
                `Error deleting large file: ${unlinkErr.message}`
              );
            });
          } else {
            resolve();
          }
        });
      })
      .on("error", (err) => {
        throw new Error(`Error converting video to MP3: ${err.message}`);
      })
      .save(outputPath);
  });
}

function returnOption(state, x, y) {
  return {
    info: {
      title: "Hello ji",
      script_type: "v4.00+",
      collisions: "Normal",
      play: {
        res: {
          x,
          y,
        },
        depth: 0,
      },
      timer: "100.0000",
      wrap_style: 1,
    },
    style: {
      name: "Middle",
      font: {
        family: "Garamond",
        size: state.fontSize || 50,
        scale: {
          x,
          y,
        },
      },
      color: {
        primary: hexToASSColor(state?.primaryColor) || "&H00DEAE5A",
        secondary: hexToASSColor(state?.secondaryColor) || "&H0071C17B",
        outline: hexToASSColor(state?.outlineColor) || "&H000000E1",
        background: hexToASSColor(state?.backgroundColor) || "&H00818181",
      },
      bold: state.boldCaption ? 10 : 1,
      italic: 0,
      underline: 0,
      strikeout: 0,
      spacing: 0,
      angle: 0,
      border: {
        style: 1,
        outline: state.outlineCaption ? 10 : 1,
        shadow: 1,
      },
      alignment: 2,
      margin: {
        left: 5,
        right: 5,
        vertical: 0,
      },
      encoding: 0,
    },
    event: {
      layer: 0,
      time: {
        start: "",
        end: "",
      },
      effect: "EFFECTHERE",
      margin: {
        left: 0,
        right: 0,
        vertical: 0,
      },
      style: "Middle",
      name: "",
      text: "",
    },
    events: [],
  };
}

async function checkUserToken(task) {
  try {
    const user = await query(`SELECT * FROM user WHERE uid = ?`, [task?.uid]);
    if (user.length < 1) {
      throw new Error(`User not found with UID: ${user[0]?.uid}`);
    } else {
      const openAiToken = user[0]?.openai_token || 0;
      const geminiAiToken = user[0]?.gemini_token || 0;

      if (parseInt(openAiToken) < 2000) {
        throw new Error(`You need atleast 2000 tokens to run this function`);
      }

      return {
        user: user[0],
        geminiAiToken: parseInt(geminiAiToken),
        openAiToken: parseInt(openAiToken),
      };
    }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

async function textToAudio(state, prompt, speechFile, user) {
  try {
    const api = await getAllAPIKeys();
    const openai = new OpenAI({
      apiKey: api?.open_ai,
    });

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: state?.voice || "alloy",
      input: prompt,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(speechFile, buffer);

    const tokenConsumed = countWordsAndCalculatePriceTTS(prompt).wordCount;
    const [userData] = await query(`SELECT * FROM user WHERE uid = ?`, [
      user?.uid,
    ]);
    const userToken = parseInt(userData?.openai_token);

    if (userToken < tokenConsumed) {
      throw new Error(`You dont have enough tokens to run code #tta`);
    }

    const finalToken = userToken - tokenConsumed;
    await query(`UPDATE user SET openai_token = ? WHERE uid = ?`, [
      finalToken,
      user?.uid,
    ]);
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

async function audioToText(audioPath, state, user) {
  try {
    const api = await getAllAPIKeys();
    const openai = new OpenAI({
      apiKey: api?.open_ai,
    });

    const getCodeLang = langArr.filter((i) => i.language == state?.language);
    const langCode = getCodeLang?.length > 0 ? getCodeLang[0]?.code : "";

    let srt;

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: "whisper-1",
      response_format: state?.captionType == "word" ? "verbose_json" : "srt",
      timestamp_granularities:
        state?.captionType == "word" ? ["word"] : ["segment"],
      language: langCode === "au" ? "" : langCode,
    });

    const { wordCount } = countWordsAndCalculatePrice(
      transcription.text || transcription
    );

    const [userData] = await query(`SELECT * FROM user WHERE uid = ?`, [
      user?.uid,
    ]);
    const userOpenAiToken = parseInt(userData?.openai_token);
    const finalToken = userOpenAiToken - wordCount;

    console.log("updating users token for audio to text");
    await query(`UPDATE user SET openai_token = ? WHERE uid = ?`, [
      finalToken,
      user?.uid,
    ]);

    if (state?.captionType === "word") {
      srt = convertWordsToSRT(transcription.words);
    } else {
      srt = transcription;
    }

    return { srt: srt || srt };
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

async function textToAss(srtString, outPutAss, options) {
  try {
    const tempPath = `${__dirname}/temp/tempsrt.srt`;
    fs.writeFileSync(tempPath, srtString, "utf-8");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    sub.convert(tempPath, outPutAss, options);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

async function addingCaption(task, state, user) {
  try {
    // returning if already added caption
    if (task?.caption?.length > 2) {
      console.log(`returning addingCaption function as caption already found`);
      return;
    }

    // checking if the task has audio by ai
    if (state?.chooseAudio == "ai") {
      if (!state?.choosedAudioText) {
        throw new Error(`This task does not have input text`);
      }
      const audioFileName = `${randomstring.generate(4)}.mp3`;
      const speechFile = `${__dirname}/temp/${audioFileName}`;
      await textToAudio(state, state?.choosedAudioText, speechFile, user);

      console.log("addig audio file name to mysql");
      await query(`UPDATE ai_video SET audio = ? WHERE id = ?`, [
        audioFileName,
        task?.id,
      ]);

      //   converting audio to text
      const { srt } = await audioToText(speechFile, state, user);
      const assFilePath = `${__dirname}/temp/temp.ass`;

      let widthA;
      let heightA;

      if (state?.chooseVideo == "ai") {
        const { width, height } = parseResolution(
          state.videoResolution || "11x11"
        );
        widthA = width;
        heightA = height;
      } else {
        const vidPath = `${__dirname}/../../client/public/media/${state?.choosedVideo}`;
        const { x, y } = await getVideoResolution(vidPath);
        widthA = x;
        heightA = y;
      }

      console.log({
        widthA,
        heightA,
      });

      const options = returnOption(state, widthA, heightA);

      await textToAss(srt, assFilePath, options);

      const getEffect = effectArr?.filter((i) => i.name == state?.fontEffect);

      const positionFilter = captionPosition(
        state?.captionPosition,
        widthA,
        heightA
      );

      console.log({ getEffect, positionFilter });

      const finalEffect =
        getEffect?.length > 0
          ? `${getEffect[0]?.code?.replace("}", "")}${positionFilter}}`
          : `{\\blur5\\3c&HFFC000}`;

      //   adding effcts on temp ass file
      replaceKeywordInFile(
        assFilePath,
        "EFFECTHERE,",
        `,${finalEffect}`,
        assFilePath
      );

      const assData = await readAssFile(assFilePath);

      //   updating ass text in database
      await query(`UPDATE ai_video SET caption = ? WHERE id = ?`, [
        assData,
        task?.id,
      ]);
      console.log(`state?.chooseAudio == "ai" saved to database`);
      return { audioPath: speechFile };
    }

    // checking now if choosedAudio is none
    if (state?.chooseAudio == "none") {
      const audioFileName = `${randomstring.generate(4)}.mp3`;
      const audioFilePath = `${__dirname}/temp/${audioFileName}`;
      const videoFilePath = `${__dirname}/../../client/public/media/${state?.choosedVideo}`;
      await convertVideoToMp3(videoFilePath, audioFilePath);
      console.log(`state?.chooseAudio == "none" saved video as audio mp3`);

      console.log("addig audio file name to mysql");
      await query(`UPDATE ai_video SET audio = ? WHERE id = ?`, [
        audioFileName,
        task?.id,
      ]);

      //   converting audio to text
      const { srt } = await audioToText(audioFilePath, state, user);
      const assFilePath = `${__dirname}/temp/temp.ass`;

      const { width, height } = parseResolution(state.videoResolution);

      let widthA;
      let heightA;

      if (state.videoResolution) {
        const { width, height } = parseResolution(
          state.videoResolution || "11x11"
        );
        widthA = width;
        heightA = height;
      } else {
        const vidPath = `${__dirname}/../../client/public/media/${state?.choosedVideo}`;
        const { x, y } = await getVideoResolution(vidPath);
        widthA = x;
        heightA = y;
      }

      const options = returnOption(state, widthA, heightA);

      await textToAss(srt, assFilePath, options);

      const getEffect = effectArr?.filter((i) => i.name == state?.fontEffect);
      const positionFilter = captionPosition(
        state?.captionPosition,
        widthA,
        heightA
      );

      console.log({ getEffect, positionFilter });

      const finalEffect =
        getEffect?.length > 0
          ? `${getEffect[0]?.code?.replace("}", "")}${positionFilter}}`
          : `{\\blur5\\3c&HFFC000}`;

      //   adding effcts on temp ass file
      replaceKeywordInFile(
        assFilePath,
        "EFFECTHERE,",
        `,${finalEffect}`,
        assFilePath
      );

      const assData = await readAssFile(assFilePath);

      //   updating ass text in database
      await query(`UPDATE ai_video SET caption = ? WHERE id = ?`, [
        assData,
        task?.id,
      ]);
      console.log(`state?.chooseAudio == "none" saved to database`);
      return { audioPath: audioFilePath };
    }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

const langArr = [
  { language: "Auto", code: "au" },
  { language: "Afrikaans", code: "af" },
  { language: "Albanian", code: "sq" },
  { language: "Amharic", code: "am" },
  { language: "Arabic", code: "ar" },
  { language: "Armenian", code: "hy" },
  { language: "Assamese", code: "as" },
  { language: "Azerbaijani", code: "az" },
  { language: "Bashkir", code: "ba" },
  { language: "Basque", code: "eu" },
  { language: "Belarusian", code: "be" },
  { language: "Bengali", code: "bn" },
  { language: "Bosnian", code: "bs" },
  { language: "Breton", code: "br" },
  { language: "Bulgarian", code: "bg" },
  { language: "Burmese", code: "my" },
  { language: "Castilian", code: "es" },
  { language: "Catalan", code: "ca" },
  { language: "Chinese", code: "zh" },
  { language: "Croatian", code: "hr" },
  { language: "Czech", code: "cs" },
  { language: "Danish", code: "da" },
  { language: "Dutch", code: "nl" },
  { language: "English", code: "en" },
  { language: "Estonian", code: "et" },
  { language: "Faroese", code: "fo" },
  { language: "Finnish", code: "fi" },
  { language: "Flemish", code: "nl" },
  { language: "French", code: "fr" },
  { language: "Galician", code: "gl" },
  { language: "Georgian", code: "ka" },
  { language: "German", code: "de" },
  { language: "Greek", code: "el" },
  { language: "Gujarati", code: "gu" },
  { language: "Haitian Creole", code: "ht" },
  { language: "Hausa", code: "ha" },
  { language: "Hawaiian", code: "haw" },
  { language: "Hebrew", code: "he" },
  { language: "Hindi", code: "hi" },
  { language: "Hungarian", code: "hu" },
  { language: "Icelandic", code: "is" },
  { language: "Indonesian", code: "id" },
  { language: "Italian", code: "it" },
  { language: "Japanese", code: "ja" },
  { language: "Javanese", code: "jv" },
  { language: "Kannada", code: "kn" },
  { language: "Kazakh", code: "kk" },
  { language: "Khmer", code: "km" },
  { language: "Korean", code: "ko" },
  { language: "Lao", code: "lo" },
  { language: "Latin", code: "la" },
  { language: "Latvian", code: "lv" },
  { language: "Lingala", code: "ln" },
  { language: "Lithuanian", code: "lt" },
  { language: "Luxembourgish", code: "lb" },
  { language: "Macedonian", code: "mk" },
  { language: "Malagasy", code: "mg" },
  { language: "Malay", code: "ms" },
  { language: "Malayalam", code: "ml" },
  { language: "Maltese", code: "mt" },
  { language: "Maori", code: "mi" },
  { language: "Marathi", code: "mr" },
  { language: "Mongolian", code: "mn" },
  { language: "Nepali", code: "ne" },
  { language: "Norwegian", code: "no" },
  { language: "Nynorsk", code: "nn" },
  { language: "Occitan", code: "oc" },
  { language: "Pashto", code: "ps" },
  { language: "Persian", code: "fa" },
  { language: "Polish", code: "pl" },
  { language: "Portuguese", code: "pt" },
  { language: "Punjabi", code: "pa" },
  { language: "Romanian", code: "ro" },
  { language: "Russian", code: "ru" },
  { language: "Samoan", code: "sm" },
  { language: "Serbian", code: "sr" },
  { language: "Shona", code: "sn" },
  { language: "Sindhi", code: "sd" },
  { language: "Sinhala", code: "si" },
  { language: "Slovak", code: "sk" },
  { language: "Slovenian", code: "sl" },
  { language: "Somali", code: "so" },
  { language: "Spanish", code: "es" },
  { language: "Sundanese", code: "su" },
  { language: "Swahili", code: "sw" },
  { language: "Swedish", code: "sv" },
  { language: "Tagalog", code: "tl" },
  { language: "Tajik", code: "tg" },
  { language: "Tamil", code: "ta" },
  { language: "Tatar", code: "tt" },
  { language: "Telugu", code: "te" },
  { language: "Thai", code: "th" },
  { language: "Tibetan", code: "bo" },
  { language: "Turkish", code: "tr" },
  { language: "Turkmen", code: "tk" },
  { language: "Ukrainian", code: "uk" },
  { language: "Urdu", code: "ur" },
  { language: "Uyghur", code: "ug" },
  { language: "Uzbek", code: "uz" },
  { language: "Vietnamese", code: "vi" },
  { language: "Welsh", code: "cy" },
  { language: "Xhosa", code: "xh" },
  { language: "Yiddish", code: "yi" },
  { language: "Yoruba", code: "yo" },
  { language: "Zulu", code: "zu" },
];

function convertWordsToSRT(words) {
  function formatTime(seconds) {
    function strPad(num, size) {
      return ("000" + num).slice(size * -1);
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 1000);

    return `${strPad(hours, 2)}:${strPad(minutes, 2)}:${strPad(
      secs,
      2
    )},${strPad(millis, 3)}`;
  }

  let srt = "";
  let counter = 1;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const startTime = formatTime(word.start);
    const endTime = formatTime(word.end);

    srt += `${counter}\n`;
    srt += `${startTime} --> ${endTime}\n`;
    srt += `${word.word}\n\n`;
    counter++;
  }

  return srt;
}

async function createVideo(task, state, user) {
  try {
    if (state?.chooseVideo == "manual") {
      await query(`UPDATE ai_video SET video = ? WHERE id = ?`, [
        state?.choosedVideo,
        task?.id,
      ]);
      console.log(`Found video manually so added from state`);
      return {
        videoPath: `${__dirname}/../../client/public/media/${state?.choosedVideo}`,
      };
    } else {
      const imgArr = state?.choosedVideoImage;
      if (imgArr?.length < 2) {
        throw new Error(`At least 2 images required to make a video`);
      }

      let widthA;
      let heightA;

      if (state.videoResolution) {
        const { width, height } = parseResolution(
          state.videoResolution || "11x11"
        );
        widthA = width;
        heightA = height;
      } else {
        const vidPath = `${__dirname}/../../client/public/media/${state?.choosedVideo}`;
        const { x, y } = await getVideoResolution(vidPath);
        widthA = x;
        heightA = y;
      }

      const outPutName = `${randomstring.generate(4)}.mp4`;
      const outputVideoSecFinal = `${__dirname}/temp/${outPutName}`;
      await imageToVideo(
        task,
        imgArr,
        `${widthA}x${heightA}`,
        state?.transitionEffect || "zoom",
        outputVideoSecFinal
      );

      await query(`UPDATE ai_video SET video = ? WHERE id = ?`, [
        outPutName,
        task?.id,
      ]);
      console.log(`merging video done and saved to database`);

      return { videoPath: outputVideoSecFinal };
    }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

module.exports = {
  checkUserToken,
  addingCaption,
  createVideo,
  createVideoWithAudioAndSubtitles,
};
