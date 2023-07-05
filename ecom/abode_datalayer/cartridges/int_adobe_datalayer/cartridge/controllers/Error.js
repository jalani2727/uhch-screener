'use strict';

var server = require('server');
server.extend(module.superModule);
var preferences = require('*/cartridge/config/preferences.js');

/**
 * Implementation of abobe datalayer for error page
 */
server.append('Start', function (req, res, next) {
    if (preferences.enableAdobeDataLayer) {
        let adobeDataLayer = require('*/cartridge/scripts/datalayer.js');
        let viewData = res.getViewData();
        viewData.adobeDataLayer = {};
        viewData.adobeDataLayer.PageGroup = adobeDataLayer.pageTypes.ERROR;
        viewData.adobeDataLayer.PageName = req.pageMetaData.title;
        var sections = {};
        sections.section2 = '';
        sections.section3 = '';
        sections.section4 = '';
        viewData.adobeDataLayer.sections = sections;
        viewData.adobeDataLayer.Context = adobeDataLayer.CONTEXT.GLOBAL;
        res.setViewData(viewData);
    }
    next();
});

/**
 * Implementation of abobe datalayer for ErrorCode page
 */
server.append('ErrorCode', function (req, res, next) {
    if (preferences.enableAdobeDataLayer) {
        let adobeDataLayer = require('*/cartridge/scripts/datalayer.js');
        let viewData = res.getViewData();
        viewData.adobeDataLayer = {};
        viewData.adobeDataLayer.PageGroup = adobeDataLayer.pageTypes.ERROR;
        viewData.adobeDataLayer.PageName = req.pageMetaData.title;
        var sections = {};
        sections.section2 = '';
        sections.section3 = '';
        sections.section4 = '';
        viewData.adobeDataLayer.sections = sections;
        viewData.adobeDataLayer.Context = adobeDataLayer.CONTEXT.GLOBAL;
        res.setViewData(viewData);
    }
    next();
});

module.exports = server.exports();
