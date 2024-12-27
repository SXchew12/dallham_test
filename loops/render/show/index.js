// const sharp = require("sharp");
const Jimp = require("jimp");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const path = require("path");
const fs = require("fs");
const randomstring = require("randomstring");
const { query } = require("../../../database/dbpromise");

ffmpeg.setFfmpegPath(ffmpegPath);

async function mergeVideos(folderPath, outputVideoPath) {
  return new Promise((resolve, reject) => {
    // Read all video files in the folder
    fs.readdir(folderPath, (err, files) => {
      if (err) return reject(`Error reading folder: ${err.message}`);

      // Filter only video files (you can adjust the extensions as needed)
      const videoFiles = files.filter((file) =>
        /\.(mp4|mkv|avi|mov)$/.test(file)
      );

      if (videoFiles.length === 0) {
        return reject(new Error("No video files found in the folder."));
      }

      // Create a temporary file to store the list of videos to be merged
      const tempFilePath = path.join(__dirname, "temp_videos.txt");
      const fileStream = fs.createWriteStream(tempFilePath);

      // Write each video file path to the temp file
      videoFiles.forEach((file) => {
        fileStream.write(`file '${path.join(folderPath, file)}'\n`);
      });

      fileStream.end();

      // Merge videos using ffmpeg
      ffmpeg()
        .input(tempFilePath)
        .inputOptions(["-f concat", "-safe 0"])
        .outputOptions(["-c copy"])
        .on("end", () => {
          // Delete the temporary file
          fs.unlink(tempFilePath, (err) => {
            if (err) {
              console.error("Error deleting temp file:", err);
            }
          });

          // Delete the original smaller videos
          videoFiles.forEach((file) => {
            fs.unlink(path.join(folderPath, file), (err) => {
              if (err) {
                console.error(`Error deleting file ${file}:`, err);
              }
            });
          });

          resolve();
        })
        .on("error", (err) => {
          fs.unlink(tempFilePath, (err) => {
            if (err) {
              console.error("Error deleting temp file:", err);
            }
          });
          reject(`Error merging videos: ${err.message}`);
        })
        .save(outputVideoPath);
    });
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

  // // await sharp(imagePath).resize(width, height).toFile(resizedImagePath);
  // const image = await Jimp.read(imagePath);
  // await image.resize(width, height).writeAsync(resizedImagePath);

  const image = await Jimp.read(imagePath);

  // Resize the image while maintaining the aspect ratio
  image.resize(width, Jimp.AUTO); // Resize based on width
  if (image.getHeight() < height) {
    image.resize(Jimp.AUTO, height); // Resize based on height if needed
  }

  // Center crop the image to the exact dimensions
  image.crop(
    (image.getWidth() - width) / 2, // x offset to center the crop
    (image.getHeight() - height) / 2, // y offset to center the crop
    width,
    height
  );

  // Save the resulting image
  await image.writeAsync(resizedImagePath);

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

async function imageToVideo(
  task,
  imageArr,
  resolution = "512x512",
  effectA,
  outputVideo
) {
  try {
    const taskNew = await query(`SELECT * FROM ai_video WHERE id = ?`, [
      task?.id,
    ]);
    const audio = `${__dirname}/../temp/${taskNew[0].audio}`;
    const tempPath = `${__dirname}/temp`;

    const audioDuration = await getAudioDuration(audio);

    const perImageDuration = audioDuration / imageArr.length;

    const effect = (effectA === "zoom" && {
      effect: "zoom",
      duration: audioDuration / imageArr.length || 1,
    }) ||
      (effectA === "fade" && {
        effect: "fade",
        duration: audioDuration / imageArr.length || 1,
      }) || {
        effect: "zoom",
        duration: audioDuration / imageArr.length || 1,
      };

    const imgArrWithPath = imageArr.map((i) => {
      return `${__dirname}/../../../client/public/media/${i}`;
    });

    await runLoop(
      imgArrWithPath,
      perImageDuration,
      resolution,
      tempPath,
      effect
    );

    await mergeVideos(tempPath, outputVideo);
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

module.exports = { imageToVideo };
