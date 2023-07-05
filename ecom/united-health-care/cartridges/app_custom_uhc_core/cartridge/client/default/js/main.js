window.jQuery = window.$ = require('jquery');
var processInclude = require('base/util');

require('./thirdParty/jquery.zoom');

$(document).ready(function () {
    processInclude(require('base/components/menu'));
    processInclude(require('base/components/cookie'));
    processInclude(require('./components/consentTracking'));
    processInclude(require('base/components/footer'));
    processInclude(require('./components/miniCart'));
    processInclude(require('base/components/collapsibleItem'));
    processInclude(require('base/components/search'));
    processInclude(require('./components/clientSideValidation'));
    processInclude(require('base/components/countrySelector'));
    processInclude(require('base/components/toolTip'));
    processInclude(require('./components/inputFormatting'));
});

require('base/thirdParty/bootstrap');
require('base/components/spinner');
