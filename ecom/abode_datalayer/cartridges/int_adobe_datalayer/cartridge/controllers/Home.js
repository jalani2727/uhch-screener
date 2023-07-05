'use strict';

var server = require('server');
server.extend(module.superModule);
var preferences = require('*/cartridge/config/preferences.js');

/**
 * Implementation of abobe datalayer for Home page
 */
server.append('Show', function (req, res, next) {
    if (preferences.enableAdobeDataLayer) {
        var Site = require('dw/system/Site');
        var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
        pageMetaHelper.setPageMetaData(req.pageMetaData, Site.current);
        let adobeDataLayer = require('*/cartridge/scripts/datalayer.js');
        let viewData = res.getViewData();
        viewData.adobeDataLayer = {};
        viewData.adobeDataLayer.PageGroup = adobeDataLayer.pageTypes.STARTPAGE;
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
 * Implementation of abobe datalayer for ErrorNotFound page
 */
server.append('ErrorNotFound', function (req, res, next) {
    if (preferences.enableAdobeDataLayer) {
        let adobeDataLayer = require('*/cartridge/scripts/datalayer.js');
        var viewData = res.getViewData();
        viewData.adobeDataLayer = {};
        viewData.adobeDataLayer.PageGroup = adobeDataLayer.pageTypes.ERROR;
        viewData.adobeDataLayer.PageName = req.pageMetaData.title;
        viewData.adobeDataLayer.Context = adobeDataLayer.CONTEXT.GLOBAL;
        viewData.adobeDataLayer.isErrorPage = true;
        var sections = {};
        sections.section2 = '';
        sections.section3 = '';
        sections.section4 = '';
        viewData.adobeDataLayer.sections = sections;
        res.setViewData(viewData);
    }
    next();
});

module.exports = server.exports();
