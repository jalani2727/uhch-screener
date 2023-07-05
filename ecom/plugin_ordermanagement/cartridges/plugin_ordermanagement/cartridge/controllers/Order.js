'use strict';

var server = require('server');
var Resource = require('dw/web/Resource');
var URLUtils = require('dw/web/URLUtils');
var somLoggedIn = require('*/cartridge/scripts/middleware/somLoggedIn');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var somPreferences = require('*/cartridge/config/somPreferences');
var orderHelpers = require('*/cartridge/scripts/order/orderHelpers');
var utilHelpers = require('*/cartridge/scripts/helpers/utilHelpers');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var OrderMgr = require('dw/order/OrderMgr');
var ContentMgr = require('dw/content/ContentMgr');

server.extend(module.superModule);
/**
 * Order-Track : This endpoint is used to track a placed Order
 * @name Order-Track
 * @function
 * @memberof Order
 * @param {middleware} - consentTracking.consent
 * @param {middleware} - server.middleware.https
 * @param {middleware} - somLoggedIn.validateGuestOrUserLoggedIn
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
        if (order && order.billingAddress.postalCode === req.form.trackOrderPostal && order.customerEmail === req.form.trackOrderEmail) {
            req.session.privacyCache.set('orderId', req.form.trackOrderNumber);
            req.session.privacyCache.set('orderToken', order.getOrderToken());

            res.redirect(URLUtils.https('Order-GuestDetails').toString());
        } else {
            res.redirect(URLUtils.https('Login-Show'));
        }
        next();
    }
);

/**
 * Order-GuestDetails : This endpoint is called to get Order GuestDetails
 * @name Order-GuestDetails
 * @function
 * @memberof Order
 * @param {middleware} - consentTracking.consent
 * @param {middleware} - server.middleware.https
 * @param {middleware} - somLoggedIn.validateGuestOrUserLoggedIn
 * @param {category} - sensitive
 * @param {serverfunction} - get
 */
server.get('GuestDetails',
    consentTracking.consent,
    server.middleware.https,
    somLoggedIn.validateGuestOrUserLoggedIn,
    function (req, res, next) {
        var data = {
            exitLinkText: Resource.msg('heading.order.page', 'order', null),
            exitLinkUrl: URLUtils.https('Login-Show'),
            breadcrumbs: orderHelpers.getBreadcrumbs('GuestDetails')
        };

        var orderId = req.session.privacyCache.get('orderId');
        if (orderId) {
            data.guest = {
                trackOrderNumber: orderId
            };
            data.orders = [orderHelpers.getOrderSummary(orderId)];
        } else {
            res.redirect(URLUtils.https('Login-Show'));
        }
        res.render('account/order/history', data);
        next();
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
server.replace('History',
    consentTracking.consent,
    server.middleware.https,
    somLoggedIn.validateGuestOrUserLoggedIn,
    function (req, res, next) {
        var breadcrumbs = orderHelpers.getBreadcrumbs('History');
        var ordersResult = orderHelpers.getOrders(req.currentCustomer, req.querystring, req.locale.id);
        var orders = ordersResult.orders;
        var filterValues = ordersResult.filterValues;


        res.render('account/order/history', {
            exitLinkText: Resource.msg('link.orderdetails.orderhistory', 'account', null),
            exitLinkUrl: URLUtils.https('Account-Show').toString(),
            breadcrumbs: breadcrumbs,
            orders: orders,
            orderCardContext: 'history',
            filterValues: filterValues,
            orderFilter: req.querystring.orderFilter,
            accountlanding: false
        });
        next();
    }
);

/**
 * Order-Details : This endpoint is called to get Order Details
 * @name Order-Details
 * @function
 * @memberof Order
 * @param {middleware} - consentTracking.consent
 * @param {middleware} - server.middleware.https
 * @param {middleware} - somLoggedIn.validateGuestOrUserLoggedIn,
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

        if (order && (order.customer.profile === null || (orderCustomerNo && currentCustomerNo && orderCustomerNo === currentCustomerNo))) {
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
        } else {
            res.redirect(URLUtils.https('Account-Show'));
        }
        next();
    }
);

/**
 * Order-Cancel : This endpoint is called to get Order Cancel
 * @name Order-Cancel
 * @function
 * @memberof Order
 * @param {middleware} - server.middleware.https
 * @param {middleware} - somLoggedIn.validateGuestOrUserLoggedIn
 * @param {serverfunction} - get
 */
server.get('Cancel',
    server.middleware.https,
    somLoggedIn.validateGuestOrUserLoggedIn,
    function (req, res, next) {
        var breadcrumbs = orderHelpers.getBreadcrumbs('Cancel', !!req.currentCustomer.profile, req);
        res.render('account/orderCancel', {
            exitLinkText: Resource.msg('link.orderdetails.orderhistory', 'account', null),
            exitLinkUrl: breadcrumbs[breadcrumbs.length - 1].url,
            breadcrumbs: breadcrumbs,
            order: orderHelpers.getOrderDetails(req),
            reasons: somPreferences.cancelReason,
            fulfillmentStatus: req.querystring.fulfillmentStatus
        });
        next();
    }
);

/**
 * Order-ItemsForCancelation : This endpoint is called to get Order ItemsForCancelation
 * @name Order-ItemsForCancelation
 * @function
 * @memberof Order
 * @param {middleware} - server.middleware.https
 * @param {middleware} - somLoggedIn.validateGuestOrUserLoggedIn
 * @param {serverfunction} - post
 */
server.post('ItemsForCancelation',
    server.middleware.https,
    somLoggedIn.validateGuestOrUserLoggedIn,
    function (req, res, next) {
        var cancelData = JSON.parse(req.form.cancelData);
        var somRes = orderHelpers.preCancelOrderItems(cancelData);
        var error = '';
        var orderItems = [];
        var amount = 0;
        if (somRes.ok && somRes.object.responseObj[0].isSuccess) {
            orderItems = orderHelpers.getProductItems(cancelData.lineItems, cancelData.currencyCode);
            amount = somRes.object.responseObj[0].outputValues.previewCancelOutput.changeBalances.totalAdjustedProductAmount;
            amount = utilHelpers.formatMoney(amount, cancelData.currencyCode);
        } else {
            error = JSON.stringify(somRes.errorMessage);
        }

        res.render('/account/itemsListForCancelation', {
            somRes: somRes.object,
            orderItems: orderItems,
            amount: amount,
            reason: cancelData.reason,
            error: error
        });
        next();
    }
);

/**
 * Order-CancelAccept : This endpoint is called to post Order CancelAccept
 * @name Order-CancelAccept
 * @function
 * @memberof Order
 * @param {middleware} - server.middleware.https
 * @param {middleware} - somLoggedIn.validateGuestOrUserLoggedIn
 * @param {serverfunction} - post
 */
server.post('CancelAccept',
    server.middleware.https,
    somLoggedIn.validateGuestOrUserLoggedIn,
    function (req, res, next) {
        var cancelData = JSON.parse(req.form.cancelData);
        var somRes = orderHelpers.cancelOrderItems(cancelData);
        if (somRes.ok && somRes.object.responseObj[0].isSuccess) {
            res.json({
                url: URLUtils.https('Order-CancelSuccess').toString(),
                success: true,
                changeBalances: somRes.object.responseObj[0].outputValues.submitCancelOutput.changeBalances
            });
        } else {
            res.json({
                url: URLUtils.https('Order-History').toString(),
                success: false
            });
        }
        next();
    }
);

/**
 * Order-CancelSuccess : This endpoint is called to post Order CancelSuccess
 * @name Order-CancelSuccess
 * @function
 * @memberof Order
 * @param {middleware} - server.middleware.https
 * @param {middleware} - somLoggedIn.validateGuestOrUserLoggedIn
 * @param {serverfunction} - post
 */
server.post('CancelSuccess',
    server.middleware.https,
    somLoggedIn.validateGuestOrUserLoggedIn,
    function (req, res, next) {
        var breadcrumbs = orderHelpers.getBreadcrumbs('CancelSuccess', !!req.currentCustomer.profile);
        var changeBalances = JSON.parse(req.form.changeBalances);
        var cancelData = JSON.parse(req.form.cancelData);
        var orderSummary = orderHelpers.getOrderSummary(cancelData.orderId);
        var amount = 0;
        amount = utilHelpers.formatMoney(changeBalances.totalAdjustedProductAmount, cancelData.currencyCode);
        res.render('/account/orderCancelSuccess', {
            exitLinkText: Resource.msg('link.orderdetails.orderhistory', 'account', null),
            exitLinkUrl: breadcrumbs[breadcrumbs.length - 1].url,
            breadcrumbs: breadcrumbs,
            orderItems: orderHelpers.getProductItems(cancelData.lineItems, cancelData.currencyCode),
            orderSummary: orderSummary,
            amount: amount,
            cancelData: cancelData,
            changeBalances: changeBalances
        });
        next();
    }
);

/**
 * Order-Return : This endpoint is called to get Order Return
 * @name Order-Return
 * @function
 * @memberof Order
 * @param {middleware} - server.middleware.https
 * @param {middleware} - somLoggedIn.validateGuestOrUserLoggedIn
 * @param {serverfunction} - get
 */
server.get('Return',
    server.middleware.https,
    somLoggedIn.validateGuestOrUserLoggedIn,
    function (req, res, next) {
        var breadcrumbs = orderHelpers.getBreadcrumbs('Return', !!req.currentCustomer.profile, req);
        var content = ContentMgr.getContent(somPreferences.nonRMAInfoAsset);
        var nonRMAInfo = {};
        if (content && content.custom.body) {
            nonRMAInfo.title = content.pageTitle;
            nonRMAInfo.body = content.custom.body;
        }

        res.render('account/orderReturn', {
            exitLinkText: Resource.msg('link.orderdetails.orderhistory', 'account', null),
            exitLinkUrl: breadcrumbs[breadcrumbs.length - 1].url,
            breadcrumbs: breadcrumbs,
            order: orderHelpers.getOrderDetails(req),
            reasons: somPreferences.returnReason,
            fulfillmentStatus: req.querystring.fulfillmentStatus,
            nonRMAInfo: nonRMAInfo
        });
        next();
    }
);

/**
 * Order-ItemsForReturn : This endpoint is called to post Order ItemsForReturn
 * @name Order-ItemsForReturn
 * @function
 * @memberof Order
 * @param {middleware} - server.middleware.https
 * @param {middleware} - somLoggedIn.validateGuestOrUserLoggedIn
 * @param {serverfunction} - post
 */
server.post('ItemsForReturn',
    server.middleware.https,
    somLoggedIn.validateGuestOrUserLoggedIn,
    function (req, res, next) {
        var returnData = JSON.parse(req.form.returnData);
        var orderItems = orderHelpers.getProductItems(returnData.lineItems, returnData.currencyCode);
        var somRes = orderHelpers.preReturnOrderItems(returnData, orderItems);
        var error = '';
        var amount = 0;
        if (somRes.ok && somRes.object.responseObj[0].isSuccess) {
            amount = somRes.object.responseObj[0].outputValues.previewReturnOutput.changeBalances.totalAdjustedProductAmount;
            amount = utilHelpers.formatMoney(amount, returnData.currencyCode);
        } else {
            error = JSON.stringify(somRes.errorMessage);
        }

        res.render('/account/itemsListForReturn', {
            somRes: somRes.object,
            orderItems: orderItems,
            orderItemsOptions: returnData.lineItems,
            amount: amount,
            error: error
        });
        next();
    }
);

/**
 * Order-ReturnAccept : This endpoint is called to post Order ReturnAccept
 * @name Order-ReturnAccept
 * @function
 * @memberof Order
 * @param {middleware} - server.middleware.https
 * @param {middleware} - somLoggedIn.validateGuestOrUserLoggedIn
 * @param {serverfunction} - post
 */
server.post('ReturnAccept',
    server.middleware.https,
    somLoggedIn.validateGuestOrUserLoggedIn,
    function (req, res, next) {
        var returnData = JSON.parse(req.form.returnData);
        var orderItems = orderHelpers.getProductItems(returnData.lineItems, returnData.currencyCode);
        var somRes = orderHelpers.returnOrderItems(returnData, orderItems);
        if (somRes.ok && somRes.object.responseObj[0].isSuccess) {
            res.json({
                url: URLUtils.https('Order-ReturnSuccess').toString(),
                success: true,
                changeBalances: somRes.object.responseObj[0].outputValues.submitReturnOutput.changeBalances
            });
        } else {
            res.json({
                url: URLUtils.https('Order-History').toString(),
                success: false
            });
        }
        next();
    }
);

/**
 * Order-ReturnSuccess : This endpoint is called to post Order ReturnSuccess
 * @name Order-ReturnSuccess
 * @function
 * @memberof Order
 * @param {middleware} - server.middleware.https
 * @param {middleware} - somLoggedIn.validateGuestOrUserLoggedIn
 * @param {serverfunction} - post
 */
server.post('ReturnSuccess',
    server.middleware.https,
    somLoggedIn.validateGuestOrUserLoggedIn,
    function (req, res, next) {
        var breadcrumbs = orderHelpers.getBreadcrumbs('ReturnSuccess', !!req.currentCustomer.profile);
        var changeBalances = JSON.parse(req.form.changeBalances);
        var returnData = JSON.parse(req.form.returnData);
        var orderSummary = orderHelpers.getOrderSummary(returnData.orderId);
        var amount = 0;
        amount = utilHelpers.formatMoney(changeBalances.totalAdjustedProductAmount, returnData.currencyCode);
        res.render('/account/orderReturnSuccess', {
            exitLinkText: Resource.msg('link.orderdetails.orderhistory', 'account', null),
            exitLinkUrl: breadcrumbs[breadcrumbs.length - 1].url,
            breadcrumbs: breadcrumbs,
            orderItems: orderHelpers.getProductItems(returnData.lineItems, returnData.currencyCode),
            orderSummary: orderSummary,
            amount: amount,
            changeBalances: changeBalances,
            returnData: returnData
        });
        next();
    }
);
module.exports = server.exports();
