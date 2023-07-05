'use strict';

/**
 * @namespace Home
 */
var Site = require('dw/system/Site');
var currentSiteID = Site.current.ID;
var currentSitePipeline = 'Sites-' + currentSiteID + '-Site';

var server = require('server');
server.extend(module.superModule);
/**
 * Home-Show : This endpoint is called when a shopper navigates to the home page
 * @name Base/Home-Show
 * @function
 * @memberof Home
 * @param {serverfunction} - append
 */
server.append('Show', function (req, res, next) {
    var viewData = res.getViewData();
    viewData.oauthLoginTargetEndPoint = 7;
    viewData.pricebookUpdated = true;
    next();
});

server.prepend('ErrorNotFound', function (req, res, next) {
    var preferences = require('*/cartridge/config/preferences.js');
    var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
    if (req.pageMetaData.title === currentSitePipeline) {
        var nameObj = JSON.parse(preferences.pageMetaTitle);
        var title = {};
        title.pageTitle = nameObj['Home-ErrorNotFound'] ? nameObj['Home-ErrorNotFound'].pageTitle : currentSitePipeline;
        pageMetaHelper.setPageMetaData(req.pageMetaData, title);
    }
    next();
});
module.exports = server.exports();
