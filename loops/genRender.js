const { query } = require("../database/dbpromise");
const {
  effectArr,
  hexToASSColor,
  getFileSizeInMB,
  genrateImageFromTex,
} = require("../functions/function");
const {
  checkForToken,
  convertVideoToMp3,
  fileToSrt,
  getVideoResolution,
  addCaptionsToVideo,
  getAudioDuration,
} = require("../functions/render");
const randomstring = require("randomstring");
const fs = require("fs");
const { generateImageToVideo } = require("../itv");

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

function returnOption(state, x, y) {
  console.log("in returnOption:", x, y);
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
        family: state?.fontFamily || "Garamond",
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

function forTempletUpload(task, user) {
  return new Promise(async (resolve, reject) => {
    try {
      const state = JSON.parse(task?.other);

      const mp3FileName = `${randomstring?.generate(4)}.mp3`;
      const inputPath = `${__dirname}/../client/public/media/${task?.input}`;
      const outPutMp3 = `${__dirname}/../client/public/temp/${mp3FileName}`;
      const outPutAss = `${__dirname}/../client/public/temp/${randomstring?.generate(
        4
      )}.ass`;
      const outputVideoName = `${randomstring?.generate(4)}.mp4`;
      const outputVideo = `${__dirname}/../client/public/media/${outputVideoName}`;

      //   converting video to mp3
      await convertVideoToMp3(inputPath, outPutMp3);
      const mp3size = getFileSizeInMB(outPutMp3);
      const mp3Token = parseInt(mp3size) || 1 * 100;

      const { x, y } = await getVideoResolution(inputPath);

      const positionFilter = captionPosition(state?.captionPosition, x, y);

      const getEffect = effectArr?.filter((i) => i.name == state?.fontEffect);

      console.log({ getEffect, positionFilter });

      const finalEffect =
        getEffect?.length > 0
          ? `${getEffect[0]?.code?.replace("}", "")}${positionFilter}}`
          : `{\\blur5\\3c&HFFC000}`;

      const options = returnOption(state, x, y);

      console.log({ options: JSON.stringify(options) });

      //   converting srt to ass
      const { token, text } = await fileToSrt({
        fileName: outPutMp3,
        filterString: finalEffect,
        outPutAss: outPutAss,
        captionType: state?.captionType || "word",
        lang: state?.lang || "Auto",
        options: options,
      });

      console.log({ token: token, mp3Token: mp3Token });

      await addCaptionsToVideo({
        videoPath: inputPath,
        assPath: outPutAss,
        outputPath: outputVideo,
      });

      await query(`UPDATE video_task SET status = ?, output = ? WHERE id = ?`, [
        "COMPLETED",
        outputVideoName,
        task?.id,
      ]);

      fs.unlinkSync(outPutMp3);
      console.log("mp3 deleted");
      fs.unlinkSync(outPutAss);
      console.log("ass deleted");

      const tokenTook = parseInt(token) + parseInt(mp3Token);
      console.log({ tokenTook, user });
      const newTokenVal = parseInt(user?.openai_token) - tokenTook;

      await query(`UPDATE user SET openai_token = ? WHERE uid = ?`, [
        newTokenVal < 0 ? 0 : newTokenVal,
        user?.uid,
      ]);

      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

function withAudio(task, user) {
  return new Promise(async (resolve, reject) => {
    try {
      const state = JSON.parse(task?.other);

      const outputFileName = `${randomstring.generate(4)}.mp4`;
      const outputPath = `${__dirname}/../client/public/media/${outputFileName}`;
      const tempPath = `${__dirname}/../itv/temp`;
      const inputMp3 = `${__dirname}/../client/public/media/${state?.input}`;
      const mp3Length = await getAudioDuration(inputMp3);

      const mp3size = getFileSizeInMB(inputMp3);
      const mp3Token = parseInt(mp3size) || 1 * 100;

      const positionFilter = captionPosition(
        state?.captionPosition,
        state.x,
        state.y
      );
      const options = returnOption(
        state,
        state?.x || "720",
        state?.y || "1280"
      );

      const outPutAss = `${__dirname}/../itv/temp/${randomstring?.generate(
        4
      )}.ass`;

      console.log({ positionFilter });

      const getEffect = effectArr?.filter((i) => i.name == state?.fontEffect);

      const finalEffect =
        getEffect?.length > 0
          ? `${getEffect[0]?.code?.replace("}", "")}${positionFilter}}`
          : `{\\blur5\\3c&HFFC000}`;

      // convert to ass
      const { token, text } = await fileToSrt({
        fileName: inputMp3,
        filterString: finalEffect,
        outPutAss: outPutAss,
        captionType: state?.captionType || "word",
        lang: state?.lang || "Auto",
        options: options,
      });

      console.log({ text });

      let imgToken = 0;
      let imgArr = [];
      let imgLength = 0;

      if (state?.imgType == "UPLOAD") {
        imgArr = state.imgArr?.map((i) => {
          return `${__dirname}/../client/public/media/${i}`;
        });
        imgToken = 0;
        imgLength = state.imgArr?.length || 1;
      } else {
        const { savedNames, totalTokens } = await genrateImageFromTex(
          text,
          state?.totalImg || 2,
          "512x512"
        );
        imgArr = savedNames.map((i) => {
          return `${__dirname}/../itv/temp/${i}`;
        });
        imgToken = totalTokens || 0;
        imgLength = savedNames?.length || 1;
      }

      const effect = (state?.transitionEffect === "zoom" && {
        effect: "zoom",
        duration: mp3Length / imgLength,
      }) ||
        (state?.transitionEffect === "fade" && {
          effect: "fade",
          duration: mp3Length / imgLength > 3 ? 2 : mp3Length / imgLength,
        }) || {
          effect: "zoom",
          duration: mp3Length / imgLength,
        };

      console.log({ effect, finalEffectttt: finalEffect });

      await generateImageToVideo(
        imgArr,
        tempPath,
        inputMp3,
        outputPath,
        effect,
        `${state?.x}x${state.y}`,
        outPutAss
      );

      await query(`UPDATE video_task SET status = ?, output = ? WHERE id = ?`, [
        "COMPLETED",
        outputFileName,
        task?.id,
      ]);

      const totalConsumedToken =
        parseInt(token) + parseInt(imgToken) + parseInt(mp3Token);
      const finalToken = parseInt(user?.openai_token) - totalConsumedToken;

      await query(`UPDATE user SET openai_token = ? WHERE uid = ?`, [
        finalToken < 0 ? 0 : finalToken,
        user?.uid,
      ]);

      resolve();

      console.log({ totalConsumedToken });
    } catch (err) {
      await query(`UPDATE video_task SET err = ? WHERE id = ?`, [
        err?.toString(),
        task?.id,
      ]);
      reject(err);
    }
  });
}

function runRender(task, user) {
  return new Promise(async (resolve, reject) => {
    try {
      // checking token
      await checkForToken(user);

      if (task?.templet == "upload") {
        await forTempletUpload(task, user);
      } else if (task?.templet == "audio") {
        await withAudio(task, user);
      }
      resolve();
    } catch (err) {
      await query(`UPDATE video_task SET err = ? WHERE id = ?`, [
        err?.toString(),
        task?.id,
      ]);
      reject(err);
    }
  });
}

async function runGenRender() {
  try {
    const getVideoTask = await query(
      `SELECT * FROM video_task WHERE status = ? AND err IS NULL`,
      ["QUEUE"]
    );

    if (getVideoTask?.length > 0) {
      const user = await query(`SELECT * FROM user WHERE uid = ?`, [
        getVideoTask[0]?.uid,
      ]);
      await runRender(getVideoTask[0], user[0]);
      console.log("TASK DONE");
    } else {
      // console.log("No video task found funtion will run again after 2 sec");
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
    await runGenRender();
  } catch (err) {
    console.log(err);
  }
}

module.exports = { runGenRender };
