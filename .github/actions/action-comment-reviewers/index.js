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

    // Comment that a reviewer has been assigned.
    const githubToken = core.getInput("GITHUB_TOKEN");
    const context = github.context;
    const prNumber = context.payload.pull_request.number;
    const prAuthor = context.payload.pull_request.user.login;
    const octokit = new Octokit();

    if (prAuthor === "dependabot-preview[bot]") {
      const allReviewers = context.payload.pull_request.requested_reviewers;
      const usersToRemove = allReviewers.map((user) => user.login);
      console.log("User log | usersToRemove", usersToRemove);

      const response = await octokit.pulls.removeRequestedReviewers({
        owner: "akoliyot",
        repo: "hello-app",
        pull_number: prNumber,
        reviewers: usersToRemove,
      });

      console.log("User log | removeRequestedReviewers response", response);

      octokit.issues.createComment({
        ...context.repo,
        issue_number: prNumber,
        body: `All reviewers have been removed.`,
      });
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
