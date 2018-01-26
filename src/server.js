const dotenv = require("dotenv").config();
const { IncomingWebhook, WebClient } = require("@slack/client");
const { Curriculum, GitHub } = require("curriculum-tools").content;
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const client = new WebClient(process.env.SLACK_TOKEN);
const webhook = new IncomingWebhook(process.env.SLACK_WEB_HOOK_URL);
const curriculum = new Curriculum(new GitHub("submodules"));

let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  // Serve an asset here, like an HTML page.
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.listen(process.env.PORT, (err) => {
  if (err) throw err;

  console.log(`🍃  Parakeet web services are now operational on PORT ${process.env.PORT}`);

  if (process.env.SLACK_TOKEN) {
    console.log(`🍃  Parakeet slack integration is now operational.`);
    // TODO: Initialize the bot, start accepting user interaction.
  }
})

console.log(curriculum.topics);

// TODO: Implement express-style app, so we can make it easier to add multi-slack support later on.
// TODO: Implement a command listener that allows the bot to trigger the main functionality sequence.
// It will look something like the following:
// 1. User -> Runs the command "/enki" or similar.
// 2. Bot -> Responds with a menu list of topics available, with option to select.
// 3. User -> Responds via emoji with the topic they would like to work on.
// 4. Bot -> Responds with the next challenge available, if previous are done continue where left off.
// 5. <-> This would be the actual sequence where they work on the challenge
