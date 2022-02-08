'use strict';
var GitHubApi = require('github');
var config = require('../config');

var github = new GitHubApi({
    version: '3.0.0',
    headers: {
        Authorization: `Bearer ${config.ghToken}`,
    }
});

module.exports.connection = github;

module.exports.getMasterSHA = function () {
    return new Promise((fulfill, reject) => {
        github.gitdata.getReference({
            user: config.ghUser,
            repo: config.ghRepo,
            ref: 'heads/master'
        }, function (err, data) {
            if (err) {
                return reject(err);
            }
            fulfill(data.object.sha);
        });
    });
};

module.exports.getContent = function (path, ref) {
    return new Promise((fulfill, reject) => {
        github.repos.getContent({
            user: config.ghUser,
            repo: config.ghRepo,
            path: path,
            ref: ref || 'master'
        }, function (err, data) {
            if (err) {
                return reject(err);
            }
            fulfill(data);
        });
    });
};

module.exports.createBranch = function (name, originSHA) {
    return new Promise((fulfill, reject) => {
        github.gitdata.createReference({
            user: config.ghUser,
            repo: config.ghRepo,
            ref: `refs/heads/${name}`,
            sha: originSHA
        }, function (err, data) {
            if (err) {
                return reject(err);
            }
            fulfill(data);
        });
    });
};

module.exports.updateFile = function (path, content, fileSHA, branch, commitMessage, authorName, authorEmail) {
    return new Promise((fulfill, reject) => {
        github.repos.updateFile({
            user: config.ghUser,
            repo: config.ghRepo,
            path: path,
            content: (new Buffer(content).toString('base64')),
            branch: branch,
            sha: fileSHA,
            message: commitMessage,
            author: {
                name: authorName,
                email: authorEmail
            }
        }, function (err, data) {
            if (err) {
                return reject(err);
            }
            fulfill(data);
        });
    });
};

module.exports.createPR = function (title, head, base) {
    return new Promise((fulfill, reject) => {
        github.pullRequests.create({
            user: config.ghUser,
            repo: config.ghRepo,
            title: title,
            head: head,
            base: base || 'master'
        }, function (err, data) {
            if (err) {
                return reject(err);
            }
            fulfill(data);
        });
    });
};
