'use strict';

var processInclude = require('base/util');

$(document).ready(function () {
    processInclude(require('./hearingTest/hearingTestDetails'));
    processInclude(require('./hearingTest/hearingTestUpload'));
});
