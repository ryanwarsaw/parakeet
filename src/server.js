const dotenv = require("dotenv").config();
const { IncomingWebhook, WebClient } = require("@slack/client");
const { Curriculum, GitHub } = require("curriculum-tools").content;

const client = new WebClient(process.env.SLACK_TOKEN);
const webhook = new IncomingWebhook(process.env.SLACK_WEB_HOOK_URL);
const curriculum = new Curriculum(new GitHub("submodules"));

console.log(curriculum.topics);

// TODO: Implement express-style app, so we can make it easier to add multi-slack support later on.
// TODO: Implement a command listener that allows the bot to trigger the main functionality sequence.
// It will look something like the following:
// 1. User -> Runs the command "/enki" or similar.
// 2. Bot -> Responds with a menu list of topics available, with option to select.
// 3. User -> Responds via emoji with the topic they would like to work on.
// 4. Bot -> Responds with the next challenge available, if previous are done continue where left off.
// 5. <-> This would be the actual sequence where they work on the challenge
