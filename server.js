const dotenv = require("dotenv").config();
const { IncomingWebhook, WebClient } = require("@slack/client");
const curriculum = require("curriculum-tools");

const client = new WebClient(process.env.SLACK_TOKEN);
const webhook = new IncomingWebhook(process.env.SLACK_WEB_HOOK_URL);
