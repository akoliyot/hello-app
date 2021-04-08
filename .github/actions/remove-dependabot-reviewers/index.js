const core = require("@actions/core");
const github = require("@actions/github");
const { Octokit } = require("@octokit/action");

async function main() {
  try {
    const nameToGreet = core.getInput("who-to-greet");
    console.log(`Hello ${nameToGreet}`);

    const time = new Date().toTimeString();
    core.setOutput("time", time);

    const payload = JSON.stringify(github.context.payload, undefined, 2);
    console.log(`The event payload: ${payload}`);

    const context = github.context;
    const prNumber = context.payload.pull_request.number;
    const prAuthor = context.payload.pull_request.user.login;
    const octokit = new Octokit();

    const labels = context.payload.pull_request.labels;
    const shouldKeepReviewers = labels.find(
      (labelItem) => labelItem.name === "review-required"
    );

    if (shouldKeepReviewers) {
      return;
    }

    if (prAuthor === "dependabot-preview[bot]") {
      const usersToRemove = context.payload.pull_request.requested_reviewers.map(
        (user) => user.login
      );

      const response = await octokit.pulls.removeRequestedReviewers({
        // Owner of the repo. Can be a user or an organization.
        owner: "akoliyot",
        repo: "hello-app",
        pull_number: prNumber,
        // Array of user IDs to remove from the reviewers list.
        reviewers: usersToRemove,
      });

      octokit.issues.createComment({
        ...context.repo,
        issue_number: prNumber,
        body: `Reviewers have been removed to reduce noice in Github PR notifications. If you wish to keep them please add the "review-required" label and then set the reviewers again.`,
      });
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
