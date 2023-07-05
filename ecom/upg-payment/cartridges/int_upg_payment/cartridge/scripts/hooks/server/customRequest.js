'use strict';

exports.onRequest = function () {
    var BasketMgr = require('dw/order/BasketMgr');
    var URLUtils = require('dw/web/URLUtils');
    var Site = require('dw/system/Site');
    var currentBasket = BasketMgr.getCurrentBasket();
    var httpPath = request.httpPath.split('/');
    var pipeline = httpPath[httpPath.length - 1];
    var currentSiteID = Site.current.ID;
    var currentSitePipeline = 'Sites-' + currentSiteID + '-Site';


    if (pipeline !== 'CheckoutServices-PlaceOrder' && pipeline !== 'CheckoutServices-FailOrder' && pipeline !== '__Analytics-Start' && pipeline !== 'Build-BuildContentView') {
        if ((currentBasket === null) && !empty(session.custom.currentOrderNo)) {
            var OrderMgr = require('dw/order/OrderMgr');
            var order = OrderMgr.getOrder(session.custom.currentOrderNo);
            var Transaction = require('dw/system/Transaction');
            Transaction.wrap(function () { OrderMgr.failOrder(order, true); });
            delete session.custom.currentOrderNo;
        }
    }
    // redirecting to error page for the base cartridge exposed Controllers
    if (pipeline === 'PaymentInstruments-List' ||
        pipeline === 'PaymentInstruments-AddPayment' ||
        pipeline === 'Account-EditProfile' ||
        pipeline === 'Account-EditPassword' ||
        pipeline === 'Account-PasswordReset') {
        response.redirect(URLUtils.https('Home-ErrorNotFound'));
    }

    // changes for the mircrosite
    if ((pipeline === 'Default-Start' || pipeline === currentSitePipeline) && request.getHttpReferer() === null) {
        delete session.custom.appID;
    } else if ((pipeline === 'Default-Start' || pipeline === currentSitePipeline) && (request.getHttpReferer() !== '' || request.getHttpReferer() !== null) && session.custom.appID && (session.custom.appID !== '' || session.custom.appID !== null)) {
        response.redirect(URLUtils.https('UHC-TPA', 'navDeepDive', session.custom.appID));
    }

    if (pipeline === 'UHC-TPA') {
        var navDeepDive = request.getHttpParameterMap().navDeepDive.value;
        var preferences = require('*/cartridge/config/preferences.js');
        var validListing = preferences.micrositeUsersList;
        if (validListing && validListing.indexOf(navDeepDive) !== -1) {
            session.custom.appID = navDeepDive;
        }
    }
};
