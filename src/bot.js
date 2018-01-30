const { IncomingWebhook, WebClient } = require("@slack/client");
const { Curriculum, GitHub } = require("curriculum-tools").content;

const curriculum = new Curriculum(new GitHub("submodules"));
const fs = require("fs");

class SlackBot {
  constructor() {
    this.questions = {};
    this.default_database_template = {};

    if (process.env.SLACK_TOKEN && process.env.SLACK_WEB_HOOK_URL) {
      this.client = new WebClient(process.env.SLACK_TOKEN);
      this.webhook = new IncomingWebhook(process.env.SLACK_WEB_HOOK_URL);
      console.log("🍃  Parakeet slack integration is now operational.");
    } else {
      console.error("🍃 Parakeet tried to initialize Slack bot but couldn't find" +
        "the proper environment variable configuration. Please check your .env file.");
    }

    this.populateQuestionBase();
    //console.log(JSON.stringify(this.questions, null, 2));
  }

  commandHandler(name, channel_id) {
    //this.client.chat.postMessage(channel_id, "Hey, there.").then((res) => {
    //  console.log("Message sent: ", res.ts);
    //}).catch(console.error);
  }

  /**
   * The results are pretty shady but it works.
   **/
  populateQuestionBase() {
    for (let topicKey in curriculum.topics) {
      let topic = curriculum.topics[topicKey];
      if (this.questions[topicKey] === undefined) {
        this.questions[topicKey] = {courses: {}};
        this.default_database_template[topicKey] = {courses: {}};
      }

      for (let courseKey in topic.courses) {
        let course = topic.courses[courseKey];
        if (this.questions[topicKey]["courses"][courseKey] === undefined) {
          this.questions[topicKey]["courses"][courseKey] = {questions: []};
          this.default_database_template[topicKey]["courses"][courseKey] = {questions: {total: 0, unanswered: 0}};
        }

        for (let workoutKey in course.workouts) {
          let workout =  course.workouts[workoutKey];
          for (let insightKey in workout.insights) {
            let insight = workout.insights[insightKey];

            if (insight["practiceQuestion"] !== undefined) {
              if (insight["practiceQuestion"]["text"] !== undefined) {
                let db_template_course_questions = this.default_database_template[topicKey]["courses"][courseKey]["questions"];
                db_template_course_questions["total"]++;
                db_template_course_questions["unanswered"]++;
                this.questions[topicKey]["courses"][courseKey]["questions"].push({
                  title: insight.title,
                  context: insight.content,
                  question: insight["practiceQuestion"]["text"],
                  answers: insight["practiceQuestion"]["answers"]
                });
              }
            }
          }
        }
      }
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
