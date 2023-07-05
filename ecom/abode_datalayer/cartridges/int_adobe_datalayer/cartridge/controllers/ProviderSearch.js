'use strict';

var server = require('server');
server.extend(module.superModule);
var preferences = require('*/cartridge/config/preferences.js');

/**
 * Implementation of abobe datalayer for Provider page
 */
server.append('Show', function (req, res, next) {
    if (preferences.enableAdobeDataLayer) {
        let adobeDataLayer = require('*/cartridge/scripts/datalayer.js');
        let viewData = res.getViewData();
        viewData.adobeDataLayer = {};
        viewData.adobeDataLayer.PageGroup = adobeDataLayer.pageTypes.PROVIDER;
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
 * Implementation of abobe datalayer for Provider Submit page
 */
server.append('Submit', function (req, res, next) {
    if (preferences.enableAdobeDataLayer) {
        let adobeDataLayer = require('*/cartridge/scripts/datalayer.js');
        let viewData = res.getViewData();
        viewData.adobeDataLayer = {};
        viewData.adobeDataLayer.PageGroup = adobeDataLayer.pageTypes.PROVIDER;
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
 * Implementation of abobe datalayer for Provider RequestAppointmentAuthForm page
 */
server.append('RequestAppointmentAuthForm', function (req, res, next) {
    if (preferences.enableAdobeDataLayer) {
        let adobeDataLayer = require('*/cartridge/scripts/datalayer.js');
        let viewData = res.getViewData();
        viewData.adobeDataLayer = {};
        viewData.adobeDataLayer.PageGroup = adobeDataLayer.pageTypes.PROVIDER;
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
 * Implementation of abobe datalayer for Provider RequestAppointmentSubmit page
 */
server.append('RequestAppointmentSubmit', function (req, res, next) {
    if (preferences.enableAdobeDataLayer) {
        let adobeDataLayer = require('*/cartridge/scripts/datalayer.js');
        let viewData = res.getViewData();
        viewData.adobeDataLayer = {};
        viewData.adobeDataLayer.PageGroup = adobeDataLayer.pageTypes.PROVIDER;
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
