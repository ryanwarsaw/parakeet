const { IncomingWebhook, WebClient } = require("@slack/client");
const { Curriculum, GitHub } = require("curriculum-tools").content;

const curriculum = new Curriculum(new GitHub("submodules"));

class SlackBot {
  constructor() {
    if (process.env.SLACK_TOKEN && process.env.SLACK_WEB_HOOK_URL) {
      this.client = new WebClient(process.env.SLACK_TOKEN);
      this.webhook = new IncomingWebhook(process.env.SLACK_WEB_HOOK_URL);
      console.log("🍃  Parakeet slack integration is now operational.");
    } else {
      console.error("🍃 Parakeet tried to initialize Slack bot but couldn't find" +
        "the proper environment variable configuration. Please check your .env file.");
    }
  }
}

module.exports = { SlackBot }

// TODO: Implement a command listener that allows the bot to trigger the main functionality sequence.
// It will look something like the following:
// 1. User -> Runs the command "/enki" or similar.
// 2. Bot -> Responds with a menu list of topics available, with option to select.
// 3. User -> Responds via emoji with the topic they would like to work on.
// 4. Bot -> Responds with the next challenge available, if previous are done continue where left off.
// 5. <-> This would be the actual sequence where they work on the challenge
