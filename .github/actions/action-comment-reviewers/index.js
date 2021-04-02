const core = require("@actions/core");
const github = require("@actions/github");
const { Octokit } = require("@octokit/action");

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

  const message = "Reviewer has been notified";

  const octokit = new Octokit();
  octokit.issues.createComment({
    ...context.repo,
    issue_number: prNumber,
    body: `Hey, ${prAuthor}! ${message}`,
  });
} catch (error) {
  core.setFailed(error.message);
}
