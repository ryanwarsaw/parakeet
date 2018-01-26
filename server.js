const dotenv = require("dotenv").config();
const { IncomingWebhook, WebClient } = require("@slack/client");
const { Curriculum, GitHub } = require("curriculum-tools").content;

const client = new WebClient(process.env.SLACK_TOKEN);
const webhook = new IncomingWebhook(process.env.SLACK_WEB_HOOK_URL);
const curriculum = new Curriculum(new GitHub(process.argv[2]));
// TODO: Get rid of this, instead use git sub-modules locally.

console.log(curriculum.getStats());
