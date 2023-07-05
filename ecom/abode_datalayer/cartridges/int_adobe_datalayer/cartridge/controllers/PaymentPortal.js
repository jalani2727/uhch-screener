'use strict';
var server = require('server');
server.extend(module.superModule);
var preferences = require('*/cartridge/config/preferences.js');

/**
 * Implementation of abobe datalayer for Payment portal landing page
 */
server.append('Show', function (req, res, next) {
    if (preferences.enableAdobeDataLayer) {
        let adobeDataLayer = require('*/cartridge/scripts/datalayer.js');
        let viewData = res.getViewData();
        viewData.adobeDataLayer = {};
        viewData.adobeDataLayer.PageGroup = adobeDataLayer.pageTypes.GUESTPAYMENT;
        viewData.adobeDataLayer.PageName = req.pageMetaData.title;
        viewData.adobeDataLayer.Context = adobeDataLayer.CONTEXT.GLOBAL;
        var sections = {};
        sections.section2 = '';
        sections.section3 = '';
        sections.section4 = '';
        viewData.adobeDataLayer.sections = sections;
        res.setViewData(viewData);
    }
    next();
});

/**
 * Implementation of abobe datalayer for Payment portal payment page
 */
server.append('PaymentPage', function (req, res, next) {
    if (preferences.enableAdobeDataLayer) {
        let adobeDataLayer = require('*/cartridge/scripts/datalayer.js');
        let viewData = res.getViewData();
        viewData.adobeDataLayer = {};
        viewData.adobeDataLayer.PageGroup = adobeDataLayer.pageTypes.GUESTPAYMENT;
        viewData.adobeDataLayer.PageName = req.pageMetaData.title;
        viewData.adobeDataLayer.Context = adobeDataLayer.CONTEXT.GLOBAL;
        var sections = {};
        sections.section2 = '';
        sections.section3 = '';
        sections.section4 = '';
        viewData.adobeDataLayer.sections = sections;
        res.setViewData(viewData);
    }
    next();
});

/**
 * Implementation of abobe datalayer for Payment portal No payment page
 */
server.append('NoPaymentPage', function (req, res, next) {
    if (preferences.enableAdobeDataLayer) {
        let adobeDataLayer = require('*/cartridge/scripts/datalayer.js');
        let viewData = res.getViewData();
        viewData.adobeDataLayer = {};
        viewData.adobeDataLayer.PageGroup = adobeDataLayer.pageTypes.GUESTPAYMENT;
        viewData.adobeDataLayer.PageName = req.pageMetaData.title;
        viewData.adobeDataLayer.Context = adobeDataLayer.CONTEXT.GLOBAL;
        var sections = {};
        sections.section2 = '';
        sections.section3 = '';
        sections.section4 = '';
        viewData.adobeDataLayer.sections = sections;
        res.setViewData(viewData);
    }
    next();
});

/**
 * Implementation of abobe datalayer for Payment portal Confirmation page
 */
server.append('Confirmation', function (req, res, next) {
    if (preferences.enableAdobeDataLayer) {
        let adobeDataLayer = require('*/cartridge/scripts/datalayer.js');
        let viewData = res.getViewData();
        viewData.adobeDataLayer = {};
        viewData.adobeDataLayer.PageGroup = adobeDataLayer.pageTypes.GUESTPAYMENT;
        viewData.adobeDataLayer.PageName = req.pageMetaData.title;
        viewData.adobeDataLayer.Context = adobeDataLayer.CONTEXT.GLOBAL;
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
