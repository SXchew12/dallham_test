const sharp = require("sharp");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const path = require("path");
const fs = require("fs");
const randomstring = require("randomstring");
const { deleteFileIfExists } = require("../functions/function");

ffmpeg.setFfmpegPath(ffmpegPath);

async function mergeVideosWithAudio(folderPath, audioPath, outputPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(folderPath, (err, files) => {
      if (err) {
        return reject(new Error("Error reading folder: " + err.message));
      }

      const videoFiles = files.filter((file) => file.endsWith(".mp4"));

      if (videoFiles.length === 0) {
        return reject(
          new Error("No video files found in the specified folder.")
        );
      }

      const videoPaths = videoFiles.map((file) => path.join(folderPath, file));

      const command = ffmpeg();
      videoPaths.forEach((video) => {
        command.input(video);
      });

      command
        .complexFilter([
          {
            filter: "concat",
            options: { n: videoPaths.length, v: 1, a: 0 },
            outputs: "v",
          },
          {
            filter: "amovie",
            options: { filename: audioPath },
            outputs: "a",
          },
        ])
        .outputOptions("-map", "[v]", "-map", "[a]")
        .output(outputPath)
        .on("end", () => {
          console.log("Video created successfully!");
          resolve();
        })
        .on("error", (err) => {
          reject(new Error("Error creating video: " + err.message));
        })
        .run();
    });
  });
}

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

function addCaptionsToVideo(videoPath, assPath, outputPath) {
  return new Promise((resolve, reject) => {
    let filterOptions = `subtitles='${assPath}'`;

    console.log("Adding caption");

    ffmpeg()
      .input(videoPath)
      .videoFilter(`${filterOptions}`)
      .output(outputPath)
      .on("end", () => {
        console.log("Processing finished!");
        resolve({ success: true });
      })
      .on("error", (err) => {
        console.error("Error: " + err.message);
        reject({ success: false, msg: err.toString() });
      })
      .run();
  });
}

function getAudioDuration(filePath) {
  return new Promise((resolve, reject) => {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        return reject(new Error("File not found: " + filePath));
      }

      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(new Error("Error retrieving audio metadata: " + err.message));
        } else {
          const duration = metadata.format.duration;
          resolve(duration);
        }
      });
    });
  });
}

async function createVideoFromImage(
  imagePath,
  duration,
  size,
  outputPath,
  effect
) {
  console.log({
    imagePath,
    duration,
    size,
    outputPath,
    effect,
  });

  const random = randomstring.generate(4);
  const [width, height] = size.split("x").map(Number);
  const resizedImagePath = path.join(
    path.dirname(outputPath),
    `${randomstring.generate(4)}.png`
  );

  await sharp(imagePath).resize(width, height).toFile(resizedImagePath);

  return new Promise((resolve, reject) => {
    let filter = "";

    if (effect) {
      switch (effect.effect) {
        case "fade":
          const fadeDuration = effect.duration || 0.5;
          const fadeStart = 0;
          const fadeEnd = duration - fadeDuration;
          filter = `fade=t=in:st=${fadeStart}:d=${fadeDuration},fade=t=out:st=${fadeEnd}:d=${fadeDuration}`;
          break;

        case "zoom":
          const zoomDuration = effect.duration || 5;
          const zoomSize = effect.size || "2";
          filter = `zoompan=z='min(zoom+0.0005,${zoomSize})':d=${
            zoomDuration * 25
          }:s=${width}x${height}`;
          break;

        default:
          console.warn("Unknown effect:", effect.effect);
      }
    }

    ffmpeg()
      .input(resizedImagePath)
      .inputFormat("image2")
      .loop(duration)
      .videoCodec("libx264")
      .size(`${width}x${height}`)
      .videoFilters(filter)
      .output(outputPath)
      .on("end", () => {
        fs.unlink(resizedImagePath, (err) => {
          if (err) console.error("Failed to delete temporary file:", err);
        });
        resolve();
      })
      .on("error", (err) => {
        reject(new Error("Error creating video: " + err.message));
      })
      .run();
  });
}

async function runLoop(
  imgArr,
  duration,
  resolution = "520x520",
  tempPath,
  effect
) {
  const fun = async (key) => {
    await createVideoFromImage(
      imgArr[key],
      duration,
      resolution,
      path.join(tempPath, `${key}.mp4`),
      effect
    );
    if (key + 1 < imgArr.length) {
      await fun(key + 1);
    }
  };

  await fun(0);
}

async function generateImageToVideo(
  imageArr,
  tempPath,
  audio,
  outputPath,
  effect,
  resolution,
  outPutAss
) {
  try {
    const audioDuration = await getAudioDuration(audio);
    const perImageDuration = audioDuration / imageArr.length;

    const tempPath2 = `${__dirname}/temp/tempVideo.mp4`;

    await runLoop(imageArr, perImageDuration, "512x512", tempPath, effect);

    deleteFileIfExists(tempPath2);
    await mergeVideosWithAudio(tempPath, audio, tempPath2);
    await addCaptionsToVideo(tempPath2, outPutAss, outputPath);

    await deleteAllFilesInFolder(tempPath);
  } catch (err) {
    console.error("Error in main function:", err.message);
    throw err;
  }
}

module.exports = { generateImageToVideo };
