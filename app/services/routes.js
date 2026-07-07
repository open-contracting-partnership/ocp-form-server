'use strict';
var forms = require('../controllers/forms');

module.exports = [
    { method: 'GET', path: '/forms', options: forms.list },
    { method: 'GET', path: '/forms/{formId}', options: forms.single },
    { method: 'GET', path: '/forms/{formId}/entries', options: forms.entries },
    { method: 'GET', path: '/forms/{formId}/entries/{entryId}', options: forms.entriesSingle },
    { method: 'PUT', path: '/forms/{formId}/entries/{entryId}', options: forms.entriesSingleUpdate }
];
