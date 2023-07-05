'use strict';

/**
 * The purpose of this module is to collect and prepare tracking data which will then be injected into the site.
 * Conceptionally the goal is to use objects we already have at certain places in our application and put them into the datalayer.
 * This way we avoid fetching additional information, which might turn out expensive.
 *
 */
var datalayerEvent = [];
var datalayerView = [];

/**
 * Page identifier
 */
var pageTypes = {
    CONTENT: 'content',
    ERROR: 'error',
    PRODUCT_DETAIL_PAGE: 'product',
    PRODUCT_LIST_PAGE: 'plp',
    SEARCH: 'search',
    STARTPAGE: 'startpage',
    ACCOUNT: 'account',
    CLP: 'category',
    BASKET: 'cart',
    OHT: 'oht',
    ORDER: 'order',
    PROVIDER: 'provider',
    CHECKOUT: 'checkout',
    CHECKOUTSHIPPING: 'checkout-shipping',
    CHECKOUTPAYMENT: 'checkout-payment',
    CHECKOUTORDERCONFIRM: 'checkout-orderconfirmation',
    CHECKOUTCUSTOMER: 'checkout-login',
    GUESTPAYMENT: 'payment',
    CONTACTUS: 'contact-us',
    LOGIN: 'login',
    ORDERHISTORY: 'order-history',
    ORDERDETAIL: 'order-detail',
    COVERAGE: 'coverage',
    FORMS: 'form'
};

var sectionTypes = {
    MYACCOUNT: 'my account',
    ORDERHISTORY: 'order history',
    ORDERDETAIL: 'order detail'
};
/**
 * function to get the view deatils
 * @param {Object} req - current request object
 * @param {string} pageGroup - allows identification of current page context
 * @param {string} pageName - pageName
 * @param {string} pageSections - pageSections
 * @param {boolean} isErrorPage - isErrorPage
 * @return {Object} - tracking data with page_level_X
 */
function getPageView(req, pageGroup, pageName, pageSections, isErrorPage) {
    var Locale = require('dw/util/Locale');
    var deviceHelpers = require('*/cartridge/scripts/helpers/deviceHelpers');
    var experienceType = deviceHelpers.isMobileOrTabletDevice() ? 'mobile' : 'desktop';
    var contentViewData = {
        experienceType: experienceType,
        is404: isErrorPage,
        lang: Locale.getLocale(request.getLocale()).getLanguage() || 'english',
        name: pageName.value,
        sitesection1: req.currentCustomer.profile ? 'secure' : 'public',
        sitesection2: pageSections.section2 || '',
        sitesection3: pageSections.section3 || '',
        sitesection4: pageSections.section4 || '',
        group: pageGroup.value
    };

    return contentViewData;
}

/**
 * function to get the user deatils
 * @param {Object} req - current request object
 * @return {Object} - tracking data with page_level_X
 */
function getUser(req) {
    var preferences = require('*/cartridge/config/preferences.js');

    var profile = req.currentCustomer.profile;
    var memberId = '';
    if (profile) {
        if (preferences.useAARP) {
            memberId = session.privacy.AARPSubscriberId !== null && session.privacy.AARP_Member ? session.privacy.AARPSubscriberId : '';
        } else {
            memberId = session.privacy.subscriberId || '';
        }
    }

    var data = {
        loginStatus: profile ? 'logged in' : 'not logged in',
        userType: profile ? 'authenticated' : 'guest',
        groupId: '',
        carrierId: '',
        hsid: '',
        rallyId: '',
        patientId: '',
        payerGroup: '',
        accountId: profile && !empty(req.currentCustomer.raw.profile.custom.sfdcContactID) ? req.currentCustomer.raw.profile.custom.sfdcContactID : '',
        memberId: memberId
    };
    return data;
}

/**
 * datalayerUtils is used to provide the individual helper functionality for various dataobjects being invoked from the page.
 */
var datalayerUtils = {};

/**
 * Retrieve global tracking data
 * @param {Object} req - current request object
 * @param {string} pageInfo - pageInfo
 * @return {Object} - tracking data with page_level_X
 */
datalayerUtils.getGlobalData = function (req, pageInfo) {
    var data = {
        event: 'page track',
        page: getPageView(req, pageInfo.pageGroup, pageInfo.pageName, pageInfo.Sections, pageInfo.isErrorPage),
        user: getUser(req)
    };
    return data;
};

module.exports = {
    // First argument is "context", which will be as any of this.CONTEXT list. Immplementation of get<CONTEXT>Data method must be in place
    // then provide any arguments needed to generate datalayer in such method
    populate: function () {
        var args = [].slice.call(arguments);
        var context = args.shift();
        var methodName = 'get' + context;
        if (typeof datalayerUtils[methodName] === 'function') {
            var dataObj = datalayerUtils[methodName].apply(datalayerUtils, args);

            // Any newly implemented 'context' goes in this if/else decision nodes
            if ([this.CONTEXT.GLOBAL].indexOf(context) > -1) {
                // page view data population
                datalayerView.push(dataObj);
            } else {
                // anything else is handled here as general event
                // this mainly links to server side event (ex: REGISTERSUCCESS)
                datalayerEvent.push(dataObj);
            }
        }
    },
    getDatalayerView: function () {
        return datalayerView;
    },
    CONTEXT: {
        GLOBAL: 'GlobalData'
    },
    pageTypes: pageTypes,
    sectionTypes: sectionTypes
};
