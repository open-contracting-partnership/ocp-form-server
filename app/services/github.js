var config = require("../config");

// @octokit/rest is ESM-only, so load it lazily with a dynamic import() from
// this CommonJS module and cache the resulting client.
var clientPromise;
function client() {
    if (!clientPromise) {
        clientPromise = import("@octokit/rest").then(
            ({ Octokit }) =>
                new Octokit({
                    auth: config.ghToken,
                }),
        );
    }
    return clientPromise;
}

module.exports.getMasterSHA = () =>
    client()
        .then((github) =>
            github.git.getRef({
                owner: config.ghUser,
                repo: config.ghRepo,
                ref: "heads/master",
            }),
        )
        .then((response) => response.data.object.sha);

module.exports.getContent = (path, ref) =>
    client()
        .then((github) =>
            github.repos.getContent({
                owner: config.ghUser,
                repo: config.ghRepo,
                path: path,
                ref: ref || "master",
            }),
        )
        .then((response) => response.data);

module.exports.createBranch = (name, originSHA) =>
    client()
        .then((github) =>
            github.git.createRef({
                owner: config.ghUser,
                repo: config.ghRepo,
                ref: `refs/heads/${name}`,
                sha: originSHA,
            }),
        )
        .then((response) => response.data);

module.exports.updateFile = (path, content, fileSHA, branch, commitMessage, authorName, authorEmail) =>
    client()
        .then((github) =>
            github.repos.createOrUpdateFileContents({
                owner: config.ghUser,
                repo: config.ghRepo,
                path: path,
                content: Buffer.from(content).toString("base64"),
                branch: branch,
                sha: fileSHA,
                message: commitMessage,
                author: {
                    name: authorName,
                    email: authorEmail,
                },
            }),
        )
        .then((response) => response.data);

module.exports.createPR = (title, head, base) =>
    client()
        .then((github) =>
            github.pulls.create({
                owner: config.ghUser,
                repo: config.ghRepo,
                title: title,
                head: head,
                base: base || "master",
            }),
        )
        .then((response) => response.data);
