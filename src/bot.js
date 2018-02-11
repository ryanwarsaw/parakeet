const { IncomingWebhook, WebClient } = require("@slack/client");
const { Curriculum, GitHub } = require("curriculum-tools").content;
const levelup = require("levelup");
const leveldown = require("leveldown");
const fs = require("fs");

const curriculum = new Curriculum(new GitHub("submodules"));
const store = levelup(leveldown("./db"));

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
  }

  /**
   * This method is called each time a user runs the command "/enki".
   *   1. Check the datastore (LevelDB) if the user has used parakeet before, if not: create new record.
   *   2. Hardwire course selection to "Node", we do this because of an issue with curriculum-tools.
   *   3. Build the message template using the question information, append the answers as "attachments".
   *   4. Fire the message off, and wait for an action POST request on route "/actions/enki" from Express.
   **/
  async commandHandler(user_id, channel_id) {
    try {
      await store.get(user_id);
    } catch (error) {
      await store.put(user_id, JSON.stringify(this.default_database_template));
    }

    let user = JSON.parse(new Buffer(await store.get(user_id)).toString());
    let user_course_progress = user["javascript"]["courses"]["node"]["questions"];
    // TODO: Make sure we deal with start|end bound situations where we've completed the course.
    let question_index = user_course_progress["total"] - user_course_progress["unanswered"];
    let question = this.questions["javascript"]["courses"]["node"]["questions"][question_index];

    let message = `*Node*:small_blue_diamond:*${question.title}*:small_blue_diamond:*(${question_index + 1}/${user_course_progress["total"]})*\n\`\`\`${question.context}\`\`\` *Question:* \`\`\`${question.question}\`\`\` *Answers:*\n`
    let attachments = {
      "attachments": [
        {
          "text": "",
          "fallback": "You are unable to choose an answer.",
          "callback_id": "question_answer",
          "color": "#708090",
          "attachment_type": "default",
          "actions": []
        }
      ]
    };

    const random_question = question.answers.keys().sort(() => Math.random() - 0.50);

    for (let i = 0; i < question.answers.length; i++) {
      attachments["attachments"][0]["text"] += `*${i + 1}.* ${question.answers[random_question[i]]} \n`
      attachments["attachments"][0]["actions"].push({
        "name": "answer",
        "text": i + 1,
        "type": "button",
        "value": `${random_question[i]}`
      });
    }

    this.client.chat.postMessage(channel_id, message, attachments).catch(console.error);
  }

  /**
   * This method is called anytime someone reacts to an "action" from a command response.
   *   1. Copy/Paste the database check, this is in-case someone other than the user clicks the button.
   *      a. We currently don't protect against this, if it was a production app we definitely should.
   *   2. We get the choice the user selected, but we don't act on it for a good reason.
   *      a. The enki curriculum doesn't appear to have an answers list, so we just ignore it for now.
   *   3. Decrement the user's "unanswered" questions value, this sets them to the next question.
   **/
  async actionHandler(user_id, channel_id, action, response_url) {
    try {
      await store.get(user_id);
    } catch (error) {
      await store.put(user_id, JSON.stringify(this.default_database_template));
    }

    let user = JSON.parse(new Buffer(await store.get(user_id)).toString());
    let answerChoice = action.value;

    if (answerChoice === "0") {
      this.client.chat.postEphemeral(channel_id, ":white_check_mark: Great job!", user_id);
    } else {
      this.client.chat.postEphemeral(channel_id, ":white_check_mark: You're wrong.", user_id);
    }

    user["javascript"]["courses"]["node"]["questions"]["unanswered"]--;
    await store.put(user_id, JSON.stringify(user));
  }

  /**
   * This processes the Enki curriculum files, and populates a generic object with questions.
   * While this does work, it doesn't seem to find all questions so this could use refinement.
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
