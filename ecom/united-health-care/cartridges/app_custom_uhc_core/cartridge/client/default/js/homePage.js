'use strict';

var processInclude = require('base/util');
require('base/productTile');

$(document).ready(function () {
    processInclude(require('./components/registrationSuccessModal'));
});
