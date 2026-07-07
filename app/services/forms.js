var github = require("./github");

module.exports.getEntriesIndex = (formId) =>
    new Promise((fulfill, reject) => {
        github
            .getContent(`data/${formId}/_index.json`)
            .then(fulfill)
            .catch((err) => {
                if (err.status !== 404) {
                    return reject(err);
                }
                return fulfill(null);
            });
    });
