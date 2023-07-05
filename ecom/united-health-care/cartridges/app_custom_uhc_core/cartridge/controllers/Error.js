'use strict';

/**
 * @namespace Address
 */

var server = require('server');
var pageMetaData = require('*/cartridge/scripts/middleware/pageMetaData');
var Site = require('dw/system/Site');
var currentSiteID = Site.current.ID;
var currentSitePipeline = 'Sites-' + currentSiteID + '-Site';
server.extend(module.superModule);

/**
 * Error-Start : This endpoint is called when there is a server error
 * @name Base/Error-Start
 * @function
 * @memberof Error
 * @param {middleware} - consentTracking.consent
 * @param {httpparameter} - error - message to be displayed
 * @param {category} - non-sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get/post
 */
server.prepend('Start', function (req, res, next) {
    var preferences = require('*/cartridge/config/preferences.js');
    var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
    if (req.pageMetaData.title === currentSitePipeline) {
        var nameObj = JSON.parse(preferences.pageMetaTitle);
        var title = {};
        title.pageTitle = nameObj['Error-Start'] ? nameObj['Error-Start'].pageTitle : currentSitePipeline;
        pageMetaHelper.setPageMetaData(req.pageMetaData, title);
    }
    next();
}, pageMetaData.computedPageMetaData
);

module.exports = server.exports();
