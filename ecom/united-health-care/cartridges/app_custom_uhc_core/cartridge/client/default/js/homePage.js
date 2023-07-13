'use strict';

var processInclude = require('base/util');
require('base/productTile');
require('../../../../../app_custom_aarphearing/cartridge/client/default/js/hearingScreener');

$(document).ready(function () {
    processInclude(require('./components/registrationSuccessModal'));
});
