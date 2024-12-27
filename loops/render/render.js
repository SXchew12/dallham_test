const { query } = require("../../database/dbpromise");
const {
  checkUserToken,
  addingCaption,
  createVideo,
  createVideoWithAudioAndSubtitles,
} = require("./function");
const fs = require("fs");
var sub = require("../../srt");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const randomstring = require("randomstring");
const path = require("path");

ffmpeg.setFfmpegPath(ffmpegPath);

function deleteAllFilesInFolder(folderPath) {
  return new Promise((resolve, reject) => {
    fs.access(folderPath, fs.constants.F_OK, (err) => {
      if (err) {
        return reject(new Error("Folder does not exist: " + folderPath));
      }

      fs.readdir(folderPath, (err, files) => {
        if (err) {
          return reject(new Error("Error reading folder: " + err.message));
        }

        if (files.length === 0) {
          return resolve("No files to delete.");
        }

        const deletePromises = files.map((file) => {
          return new Promise((resolve, reject) => {
            const filePath = path.join(folderPath, file);
            fs.unlink(filePath, (err) => {
              if (err) {
                return reject(
                  new Error(
                    "Error deleting file: " + filePath + " - " + err.message
                  )
                );
              }
              resolve();
            });
          });
        });

        Promise.all(deletePromises)
          .then(() => resolve("All files deleted successfully."))
          .catch((err) =>
            reject(new Error("Error deleting files: " + err.message))
          );
      });
    });
  });
}

function runRender() {
  return new Promise(async (resolve) => {
    const getTask = await query(
      `SELECT * FROM ai_video WHERE status = ? LIMIT 1`,
      ["QUEUE"]
    );

    if (getTask?.length < 1) {
      // console.log("No video task found.");
      resolve();
      return;
    }

    const task = getTask[0];
    try {
      // Task processing logic here
      await processVideoTask(task);

      resolve();
    } catch (err) {
      await query(`UPDATE ai_video SET status = ? WHERE id = ?`, [
        err?.toString() || "ERROR",
        task.id,
      ]);
      console.log(err);
      resolve();
    }
  });
}

async function processVideoTask(task) {
  try {
    // Simulate task processing
    console.log(`Processing task with ID: ${task.id}`);

    // Task processing code here...

    // checking for tokens
    const { user } = await checkUserToken(task);

    const state = JSON.parse(task?.state);

    await addingCaption(task, state, user);

    const { videoPath } = await createVideo(task, state, user);

    const newTask = await query(`SELECT * FROM ai_video WHERE id = ?`, [
      task?.id,
    ]);
    const taskFinal = newTask[0];

    const audioPath =
      (state?.chooseAudio == "manual" &&
        `${__dirname}/../../client/public/media/${state?.choosedAudio}`) ||
      (state?.chooseAudio == "ai" && `${__dirname}/temp/${taskFinal?.audio}`) ||
      (state?.chooseAudio == "none" && null);

    const finalVideoName = `${randomstring.generate(4)}.mp4`;
    const finalVideo = `${__dirname}/../../client/public/media/${finalVideoName}`;

    await createVideoWithAudioAndSubtitles(
      videoPath,
      taskFinal?.caption,
      finalVideo,
      audioPath
    );

    // On success, update task status to "COMPLETED"
    await query(
      `UPDATE ai_video SET final_video = ?, status = ? WHERE id = ?`,
      [finalVideoName, "COMPLETED", task.id]
    );

    await deleteAllFilesInFolder(`${__dirname}/temp`);
    console.log(`Task with ID: ${task.id} completed successfully.`);
  } catch (err) {
    console.log(err);
    throw new Error(
      `Error processing task with ID: ${task.id} - ${err.toString()}`
    );
  }
}

async function processTask() {
  try {
    await runRender();
    // console.log("Delay 5 seconds and running again...");
    await delay(5000);
    await processTask();
  } catch (err) {
    console.log(err);
  }
}

function delay(ms = 1000) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

module.exports = { processTask };
