'use strict';

var server = require('server');
server.extend(module.superModule);
var preferences = require('*/cartridge/config/preferences.js');

/**
 * Implementation of abobe datalayer for Redirect
 */
server.append('Start', function (req, res, next) {
    if (preferences.enableAdobeDataLayer) {
        var URLRedirectMgr = require('dw/web/URLRedirectMgr');
        var viewData = res.getViewData();
        var redirect = URLRedirectMgr.redirect;
        var location = redirect ? redirect.location : null;

        if (!location) {
            let adobeDataLayer = require('*/cartridge/scripts/datalayer.js');
            viewData.adobeDataLayer = {};
            viewData.adobeDataLayer.PageGroup = adobeDataLayer.pageTypes.ERROR;
            viewData.adobeDataLayer.PageName = req.pageMetaData.title;
            viewData.adobeDataLayer.Context = adobeDataLayer.CONTEXT.GLOBAL;
            viewData.adobeDataLayer.isErrorPage = true;
        }
        res.setViewData(viewData);
    }
    next();
});

module.exports = server.exports();
