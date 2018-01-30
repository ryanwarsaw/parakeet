const dotenv = require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { SlackBot } = require("./bot");

let app = express();
let bot = new SlackBot();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Serves a static HTML page, this is for adding the Slack "add integration" button.
 **/
app.get("/", async (req, res) => {
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

  // Trigger the command handler, and pass in the user_id, and channel_id.
  bot.commandHandler(payload.user_id, payload.channel_id);
  res.status(200).end();
});

/**
 * POST request triggered by Slack anytime a user responds to an "action" in chat.
 **/
app.post("/actions/enki", (req, res) => {
  let payload = JSON.parse(req.body.payload);

  // Verify that the request is coming from Slack's servers and nobody else.
  if (!payload || payload.token !== process.env.SLACK_VERIFICATION_TOKEN) {
    const errMessage = "🍃 Parakeet received a POST request from Slack with an invalid " +
      "Verification token provided, did you set it properly in your environment file?";
    console.log(errMessage);
    return res.status(401).end(errMessage);
  }

  // Trigger the action handler, pass in the user id and action information.
  bot.actionHandler(payload.user.id, payload.channel.id, payload.actions[0], payload.response_url);
  res.status(200).end();
});

/**
 * Starts the express server, and initializes the bot. At this point user interaction is accepted.
 **/
app.listen(process.env.PORT, (err) => {
  if (err) throw err;
  console.log(`🍃  Parakeet web services are now operational on PORT ${process.env.PORT}`);
});
