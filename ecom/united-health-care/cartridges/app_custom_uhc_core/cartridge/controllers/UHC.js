'use strict';

var server = require('server');
var pageMetaData = require('*/cartridge/scripts/middleware/pageMetaData');

/**
 * UHC-TPA : This endpoint is for the microSite
 * @param {middleware} - server.middleware.https
 * @param {renders} - redirects to Home page
 * @param {serverfunction} - get
 */
server.get('TPA', server.middleware.https, function (req, res, next) {
    var Site = require('dw/system/Site');
    var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
    pageMetaHelper.setPageMetaTags(req.pageMetaData, Site.current);
    var viewData = {};
    viewData.oauthLoginTargetEndPoint = 7;
    res.setViewData(viewData);
    res.render('home/homePage');
    next();
}, pageMetaData.computedPageMetaData);

module.exports = server.exports();
