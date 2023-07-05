'use strict';

var server = require('server');
server.extend(module.superModule);
var preferences = require('*/cartridge/config/preferences.js');

/**
 * Implementation of abobe datalayer for order confirmation page
 */
server.append('Confirm', function (req, res, next) {
    if (preferences.enableAdobeDataLayer) {
        let adobeDataLayer = require('*/cartridge/scripts/datalayer.js');
        let viewData = res.getViewData();
        viewData.adobeDataLayer = {};
        var pageName = 'CHECKOUTORDERCONFIRM';
        viewData.adobeDataLayer.PageGroup = adobeDataLayer.pageTypes.CHECKOUT;
        viewData.adobeDataLayer.PageName = adobeDataLayer.pageTypes[pageName];
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
 * Implementation of abobe datalayer for order History page
 */
server.append('History', function (req, res, next) {
    if (preferences.enableAdobeDataLayer) {
        let adobeDataLayer = require('*/cartridge/scripts/datalayer.js');
        let viewData = res.getViewData();
        viewData.adobeDataLayer = {};
        viewData.adobeDataLayer.PageGroup = adobeDataLayer.pageTypes.ORDER;
        viewData.adobeDataLayer.PageName = adobeDataLayer.sectionTypes.ORDERHISTORY;
        var sections = {};
        sections.section2 = req.currentCustomer.profile ? adobeDataLayer.sectionTypes.MYACCOUNT : '';
        sections.section3 = '';
        sections.section4 = '';
        viewData.adobeDataLayer.sections = sections;
        viewData.adobeDataLayer.Context = adobeDataLayer.CONTEXT.GLOBAL;
        res.setViewData(viewData);
    }
    next();
});

/**
 * Implementation of abobe datalayer for order Details page
 */
server.append('Details', function (req, res, next) {
    if (preferences.enableAdobeDataLayer) {
        let adobeDataLayer = require('*/cartridge/scripts/datalayer.js');
        let viewData = res.getViewData();
        viewData.adobeDataLayer = {};
        viewData.adobeDataLayer.PageGroup = adobeDataLayer.pageTypes.ORDER;
        viewData.adobeDataLayer.PageName = adobeDataLayer.sectionTypes.ORDERDETAIL;
        var sections = {};
        sections.section2 = req.currentCustomer.profile ? adobeDataLayer.sectionTypes.MYACCOUNT : '';
        sections.section3 = req.currentCustomer.profile ? adobeDataLayer.sectionTypes.ORDERHISTORY : '';
        sections.section4 = '';
        viewData.adobeDataLayer.sections = sections;
        viewData.adobeDataLayer.Context = adobeDataLayer.CONTEXT.GLOBAL;
        res.setViewData(viewData);
    }
    next();
});

module.exports = server.exports();
