const dotenv = require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { SlackBot } = require("./bot");

let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Serves a static HTML page, this is for adding the Slack "add integration" button.
 **/
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

/**
 * POST request triggered by Slack anytime a user types the command "/enki" in chat.
 **/
app.post("/commands/enki", (req, res) => {
  let payload = req.body;

  // Verify that the request is coming from Slack's servers and nobody else.
  if (!payload || payload.token !== process.env.SLACK_VERIFICATION_TOKEN) {
    const errMessage = "🍃 Parakeet received a POST request from Slack with an invalid " +
      "Verification token provided, did you set it properly in your environment file?";
    console.log(errMessage);
    return res.status(401).end(errMessage);
  }

  console.log(req.body);
  res.status(200).end();
});

/**
 * Starts the express server, and initializes the bot. At this point user interaction is accepted.
 **/
app.listen(process.env.PORT, (err) => {
  if (err) throw err;

  console.log(`🍃  Parakeet web services are now operational on PORT ${process.env.PORT}`);

  if (process.env.SLACK_TOKEN) {
    let bot = new SlackBot();
    console.log(`🍃  Parakeet slack integration is now operational.`);
  }
});

// TODO: Implement express-style app, so we can make it easier to add multi-slack support later on.
// TODO: Implement a command listener that allows the bot to trigger the main functionality sequence.
// It will look something like the following:
// 1. User -> Runs the command "/enki" or similar.
// 2. Bot -> Responds with a menu list of topics available, with option to select.
// 3. User -> Responds via emoji with the topic they would like to work on.
// 4. Bot -> Responds with the next challenge available, if previous are done continue where left off.
// 5. <-> This would be the actual sequence where they work on the challenge
