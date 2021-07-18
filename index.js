const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const puppeteer = require("puppeteer");
const videoRecorder = require("videoshow");

const app = express();
const port = 8000;
const jsonParser = bodyParser.json();
const path = require("path");
const screenshotPath = ["./screenshot.png"];
const videoOptions = {
  fps: 25,
  loop: 10, // seconds
  transition: false,
  videoBitrate: 1024,
  videoCodec: "libx264",
  size: "640x?",
  format: "mp4",
  pixelFormat: "yuv420p",
};

app.get("/", (requset, response) => {
  response.send("Send POST requset to start the process");
});

app.post("/", jsonParser, async (requset, response) => {
  try {
    console.log("Process started");
    const url = requset.body.url; // get url from post request
    if (!url) console.log("Invalid url, please provide a valid url");

    const browser = await puppeteer.launch(); // launch a "browser"
    const page = await browser.newPage(); // open a new page
    await page.goto(url); // go to the website
    await page.screenshot({
      // Screenshot the website
      path: "./screenshot.png", // save the screenshot in current directory
      fullPage: true, // take a fullpage screenshot
    });
    await page.close(); // close the website
    await browser.close(); // close the browser

    console.log("Recording...");
    videoRecorder(screenshotPath, videoOptions) // create video from the screenshot we toke above
      .save("video.mp4") // save the output as "video.mp4"
      .on("error", function (err) {
        console.error("Error: ", err);
      })
      .on("end", () => {
        console.log(
          "Finished to create the video.\nVideo saved in current directory"
        );
        fs.unlinkSync("./screenshot.png"); // delete the screenshot
      });

    const outputFilePath = path.join(__dirname, "video.mp4"); // save the the path
    response.send({ file: outputFilePath }); // send the output
  } catch (error) {
    console.log("Error has been occurred: " + error.message);
  }
});

// start the server
app.listen(port, () => {
  console.log(
    `App listening on port ${port} \nSend POST requset to start the process`
  );
});
