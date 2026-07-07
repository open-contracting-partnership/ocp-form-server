'use strict';
var Boom = require('@hapi/boom');
var github = require('../services/github');
var formsService = require('../services/forms');
var config = require('../config');
var _ = require('lodash');

module.exports = {
    list: {
        handler: async (request, h) => {
            try {
                let data = await github.getContent('forms');
                let forms = data.map((o) => { return { name: o.name.replace('.json', '') }; });
                return {
                    forms
                };
            } catch (err) {
                console.log('err', err);
                throw Boom.notFound();
            }
        }
    },

    single: {
        handler: (request, h) => {
            return {
                form: request.params.formId,
                message: 'This is not the page you are looking for...',
                entries_url: `${config.connection.host}:${config.connection.port}/forms/${request.params.formId}/entries`
            };
        }
    },

    entries: {
        handler: async (request, h) => {
            let data;
            try {
                data = await Promise.all([
                    github.getContent(`data/${request.params.formId}`),
                    formsService.getEntriesIndex(request.params.formId)
                ]);
            } catch (err) {
                console.log('err', err);
                throw Boom.notFound();
            }

            let entriesList = data[0];
            let _index;
            if (data[1] !== null) {
                try {
                    _index = JSON.parse((Buffer.from(data[1].content, 'base64')).toString());
                } catch (e) {
                    throw Boom.badImplementation('Resources were not valid JSON. ' + e.message);
                }
            }

            // Remove _index if it exists.
            entriesList = _.reject(entriesList, ['name', '_index.json']);

            let entries = entriesList.map((o) => {
                let _indexData = _.get(_index, o.name, {});
                _indexData.id = o.name.replace('.json', '');
                if (!_indexData.name) {
                    _indexData.name = _indexData.id;
                }
                return _indexData;
            });

            return {
                form: request.params.formId,
                entries
            };
        }
    },

    entriesSingle: {
        handler: async (request, h) => {
            let data;
            try {
                data = await Promise.all([
                    github.getMasterSHA(),
                    github.getContent(`forms/${request.params.formId}.json`),
                    github.getContent(`data/${request.params.formId}/${request.params.entryId}.json`)
                ]);
            } catch (err) {
                console.log('err', err);
                throw Boom.notFound();
            }

            let sha = data[0];
            let form = data[1];
            let entry = data[2];

            let formContent = (Buffer.from(form.content, 'base64')).toString();
            let entryContent = (Buffer.from(entry.content, 'base64')).toString();

            try {
                formContent = JSON.parse(formContent);
                entryContent = JSON.parse(entryContent);
            } catch (e) {
                throw Boom.badImplementation('Resources were not valid JSON. ' + e.message);
            }

            return {
                form: request.params.formId,
                entryName: entryContent.name,
                entry: request.params.entryId,
                meta: {
                    masterSHA: sha,
                    entrySHA: entry.sha,
                    formSchemaVersion: formContent.version
                },
                schema: formContent,
                data: entryContent.results
            };
        }
    },

    entriesSingleUpdate: {
        handler: async (request, h) => {
            let branch = `${request.payload.form}-${request.payload.entry}-update-${Date.now()}`;

            let author = {
                name: _.get(request.payload.author, 'name', 'Anonymous'),
                email: _.get(request.payload.author, 'email', 'anonymous@example.com')
            };

            if (_.trim(author.name) === '') {
                author.name = 'Anonymous';
            }

            if (_.trim(author.email) === '') {
                author.email = 'anonymous@example.com';
            }

            try {
                let data = await Promise.all([
                    github.getContent(`data/${request.params.formId}/${request.params.entryId}.json`),
                    github.createBranch(branch, request.payload.meta.masterSHA)
                ]);

                var entryContent = JSON.parse((Buffer.from(data[0].content, 'base64')).toString());

                entryContent.results = request.payload.data;
                entryContent.meta.date = Date.now();

                await github.updateFile(
                    `data/${request.params.formId}/${request.params.entryId}.json`,
                    JSON.stringify(entryContent, null, '  '),
                    request.payload.meta.entrySHA,
                    branch,
                    'Data update',
                    author.name,
                    author.email
                );

                await github.createPR(`Data update from ${author.name}`, branch);

                return {
                    statusCode: 200,
                    message: 'Pull request successfully created.'
                };
            } catch (err) {
                console.log('err', err);
                throw Boom.badImplementation();
            }
        }
    }
};
