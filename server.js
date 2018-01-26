const dotenv = require("dotenv").config();
const { IncomingWebhook, WebClient } = require("@slack/client");
const { Curriculum, GitHub } = require("curriculum-tools").content;

const client = new WebClient(process.env.SLACK_TOKEN);
const webhook = new IncomingWebhook(process.env.SLACK_WEB_HOOK_URL);
const curriculum = new Curriculum(new GitHub("submodules"));

console.log(curriculum.getStats());
