require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
// app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
app.use(fileUpload());

// routers
const userRoute = require("./routes/user");
app.use("/api/user", userRoute);

const webRoute = require("./routes/web");
app.use("/api/web", webRoute);

const adminRoute = require("./routes/admin");
app.use("/api/admin", adminRoute);

const planRoute = require("./routes/plan");
app.use("/api/plan", planRoute);

const chatRoute = require("./routes/chat");
app.use("/api/chat", chatRoute);

const embedRoute = require("./routes/embed");
app.use("/api/embed", embedRoute);

const videoRoute = require("./routes/video");
const { processTask } = require("./loops/render/render");
app.use("/api/video", videoRoute);

app.use(express.static(path.resolve(__dirname, "./client/public")));

app.get("*", function (request, response) {
  response.sendFile(path.resolve(__dirname, "./client/public", "index.html"));
});

setTimeout(() => {
  processTask();
}, 2000);

app.listen(process.env.PORT || 3010, () => {
  console.log(`Whatsham server is runnin gon port ${process.env.PORT}`);
});
