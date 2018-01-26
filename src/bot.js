const { IncomingWebhook, WebClient } = require("@slack/client");
const { Curriculum, GitHub } = require("curriculum-tools").content;

const curriculum = new Curriculum(new GitHub("submodules"));

class SlackBot {
  constructor() {
    this.client = new WebClient(process.env.SLACK_TOKEN);
    this.webhook = new IncomingWebhook(process.env.SLACK_WEB_HOOK_URL);
  }
}

module.exports = { SlackBot }
