'use strict';
var { Octokit } = require('@octokit/rest');
var config = require('../config');

var github = new Octokit({
    auth: config.ghToken
});

module.exports.connection = github;

module.exports.getMasterSHA = function () {
    return github.git.getRef({
        owner: config.ghUser,
        repo: config.ghRepo,
        ref: 'heads/master'
    }).then((response) => response.data.object.sha);
};

module.exports.getContent = function (path, ref) {
    return github.repos.getContent({
        owner: config.ghUser,
        repo: config.ghRepo,
        path: path,
        ref: ref || 'master'
    }).then((response) => response.data);
};

module.exports.createBranch = function (name, originSHA) {
    return github.git.createRef({
        owner: config.ghUser,
        repo: config.ghRepo,
        ref: `refs/heads/${name}`,
        sha: originSHA
    }).then((response) => response.data);
};

module.exports.updateFile = function (path, content, fileSHA, branch, commitMessage, authorName, authorEmail) {
    return github.repos.createOrUpdateFileContents({
        owner: config.ghUser,
        repo: config.ghRepo,
        path: path,
        content: (Buffer.from(content).toString('base64')),
        branch: branch,
        sha: fileSHA,
        message: commitMessage,
        author: {
            name: authorName,
            email: authorEmail
        }
    }).then((response) => response.data);
};

module.exports.createPR = function (title, head, base) {
    return github.pulls.create({
        owner: config.ghUser,
        repo: config.ghRepo,
        title: title,
        head: head,
        base: base || 'master'
    }).then((response) => response.data);
};
