/* eslint-disable no-unused-vars */
'use strict';

var server = require('server');
var Resource = require('dw/web/Resource');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var orderHelpers = require('*/cartridge/scripts/order/orderHelpers');
var OrderMgr = require('dw/order/OrderMgr');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var URLUtils = require('dw/web/URLUtils');
var Transaction = require('dw/system/Transaction');
var somLoggedIn = require('*/cartridge/scripts/middleware/somLoggedIn');
var pageMetaData = require('*/cartridge/scripts/middleware/pageMetaData');
var Site = require('dw/system/Site');
var currentSiteID = Site.current.ID;
var currentSitePipeline = 'Sites-' + currentSiteID + '-Site';
server.extend(module.superModule);

/**
 * Order-Details : This endpoint is called to get Order Details
 * @name Order-Details
 * @function
 * @memberof Order
 * @param {middleware} - consentTracking.consent
 * @param {middleware} - server.middleware.https
 * @param {querystringparameter} - orderID - Order ID
 * @param {querystringparameter} - orderFilter - Order Filter ID
 * @param {category} - sensitive
 * @param {serverfunction} - get
 */
server.replace('Details',
    consentTracking.consent,
    server.middleware.https,
    somLoggedIn.validateGuestOrUserLoggedIn,
    function (req, res, next) {
        var breadcrumbs = orderHelpers.getBreadcrumbs('Details', !!req.currentCustomer.profile);
        var order = OrderMgr.getOrder(req.querystring.orderID);
        var orderCustomerNo;
        var currentCustomerNo;
        if (req.currentCustomer.profile) {
            currentCustomerNo = order.customer.profile.customerNo;
            orderCustomerNo = req.currentCustomer.profile.customerNo;
        }
        var preferences = require('*/cartridge/config/preferences.js');
        var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
        if (req.pageMetaData.title === currentSitePipeline) {
            var nameObj = JSON.parse(preferences.pageMetaTitle);
            var title = {};
            title.pageTitle = nameObj['Order-Details'] ? nameObj['Order-Details'].pageTitle : currentSitePipeline;
            pageMetaHelper.setPageMetaData(req.pageMetaData, title);
        }

        res.render('account/orderDetails', {
            exitLinkText: Resource.msg('link.orderdetails.orderhistory', 'account', null),
            exitLinkUrl: breadcrumbs[breadcrumbs.length - 1].url,
            breadcrumbs: breadcrumbs,
            order: orderHelpers.getOrderDetails(req),
            orderID: req.querystring.orderID,
            orderSummaryId: req.querystring.orderSummaryId,
            fulfillmentId: req.querystring.fulfillmentId,
            fulfillmentStatus: req.querystring.fulfillmentStatus
        });
        next();
    }, pageMetaData.computedPageMetaData
);

/**
 * Order-Track : This endpoint is used to track a placed Order
 * @name Order-Track
 * @function
 * @memberof Order
 * @param {middleware} - consentTracking.consent
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.generateToken
 * @param {querystringparameter} - trackOrderNumber - Order Number to track
 * @param {querystringparameter} - trackOrderEmail - Email on the Order to track
 * @param {querystringparameter} - trackOrderPostal - Postal Code on the Order to track
 * @param {querystringparameter} - csrf_token - CSRF token
 * @param {querystringparameter} - submit - This is to submit the form
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - post
 */
server.replace('Track',
    consentTracking.consent,
    server.middleware.https,
    csrfProtection.validateRequest,
    csrfProtection.generateToken,
    function (req, res, next) {
        var order = OrderMgr.getOrder(req.form.trackOrderNumber);
        var preferences = require('*/cartridge/config/preferences.js');
        var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
        if (req.pageMetaData.title === currentSitePipeline) {
            var nameObj = JSON.parse(preferences.pageMetaTitle);
            var title = {};
            title.pageTitle = nameObj['Order-Track'] ? nameObj['Order-Track'].pageTitle : currentSitePipeline;
            pageMetaHelper.setPageMetaData(req.pageMetaData, title);
        }
        if (order) {
            var zipCodeValid = false;
            var zipCode = order.billingAddress.postalCode.length > 5 ? order.billingAddress.postalCode.slice(0, 5) : order.billingAddress.postalCode;
            if (zipCode === req.form.trackOrderPostal || order.billingAddress.postalCode === req.form.trackOrderPostal) {
                zipCodeValid = true;
            }
            if (order && order.customerEmail === req.form.trackOrderEmail && zipCodeValid) {
                req.session.privacyCache.set('orderId', req.form.trackOrderNumber);
                req.session.privacyCache.set('orderToken', order.getOrderToken());

                res.redirect(URLUtils.https('Order-Details', 'orderID', req.form.trackOrderNumber).toString());
            } else {
                var profileForm = server.forms.getForm('profile');
                var target = req.querystring.rurl || 1;
                profileForm.clear();
                var actionUrl = URLUtils.url('Account-Login', 'rurl', target);
                res.render('/account/login', {
                    navTabValue: 'login',
                    profileForm: profileForm,
                    orderTrackFormError: true,
                    userName: '',
                    actionUrl: actionUrl
                });
            }
        } else {
            res.render('/account/login', {
                orderTrackFormError: true
            });
        }
        next();
    }, pageMetaData.computedPageMetaData
);

/**
 * Order-GuestDetails : This endpoint is called to get Order GuestDetails and clear the session
 * @name Order-GuestDetails
 * @function
 * @memberof Order
 * @param {serverfunction} - append
 */
server.append('GuestDetails', function (req, res, next) {
    this.on('route:Complete', function () {
        req.session.privacyCache.set('orderId', null);
        req.session.privacyCache.set('orderToken', null);
    });
    next();
});

/**
 * Order-Details : This endpoint is called to get Order Details and clear the session
 * @name Order-Details
 * @function
 * @memberof Order
 * @param {serverfunction} - append
 */
server.append('Details', function (req, res, next) {
    this.on('route:Complete', function () {
        req.session.privacyCache.set('orderId', null);
        req.session.privacyCache.set('orderToken', null);
    });
    next();
});

/**
 * Order-Filtered : This endpoint filters the Orders shown on the Order History Page
 * @name Base/Order-Filtered
 * @function
 * @memberof Order
 * @param {middleware} - server.middleware.https
 * @param {middleware} - consentTracking.consent
 * @param {middleware} - userLoggedIn.validateLoggedInAjax
 * @param {querystringparameter} - orderFilter - Order Filter ID
 * @param {category} - sensitive
 * @param {serverfunction} - get
 */
server.append(
    'Filtered',
    function (req, res, next) {
        var data = res.getViewData();
        data.isOrderhistory = true;
        res.setViewData(data);
        return next();
    }
);

/**
 * Order-History : This endpoint is invoked to get Order History for the logged in shopper
 * @name Order-History
 * @function
 * @memberof Order
 * @param {middleware} - consentTracking.consent
 * @param {middleware} - server.middleware.https
 * @param {middleware} - somLoggedIn.validateGuestOrUserLoggedIn
 * @param {category} - sensitive
 * @param {serverfunction} - get
 */
server.prepend(
    'History',
    function (req, res, next) {
        var preferences = require('*/cartridge/config/preferences.js');
        var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
        if (req.pageMetaData.title === currentSitePipeline) {
            var nameObj = JSON.parse(preferences.pageMetaTitle);
            var title = {};
            title.pageTitle = nameObj['Order-History'] ? nameObj['Order-History'].pageTitle : currentSitePipeline;
            pageMetaHelper.setPageMetaData(req.pageMetaData, title);
        }
        next();
    }, pageMetaData.computedPageMetaData
);

/**
 * Order-Confirm : This endpoint is invoked when the shopper's Order is Placed and Confirmed
 * @name Base/Order-Confirm
 * @function
 * @memberof Order
 * @param {middleware} - consentTracking.consent
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.generateToken
 * @param {querystringparameter} - ID - Order ID
 * @param {querystringparameter} - token - token associated with the order
 * @param {category} - sensitive
 * @param {serverfunction} - get
 */
server.prepend(
    'Confirm',
    function (req, res, next) {
        var preferences = require('*/cartridge/config/preferences.js');
        var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
        if (req.pageMetaData.title === currentSitePipeline) {
            var nameObj = JSON.parse(preferences.pageMetaTitle);
            var title = {};
            title.pageTitle = nameObj['Order-Confirm'] ? nameObj['Order-Confirm'].pageTitle : currentSitePipeline;
            pageMetaHelper.setPageMetaData(req.pageMetaData, title);
        }
        next();
    }, pageMetaData.computedPageMetaData
);
module.exports = server.exports();
