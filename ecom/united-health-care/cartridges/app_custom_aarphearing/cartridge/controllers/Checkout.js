'use strict';

/**
 * @namespace Checkout
 */

var server = require('server');
server.extend(module.superModule);

/**
 * Checkout-Begin : The Checkout-Begin endpoint will render the checkout shipping page for both guest shopper and returning shopper
 * @name Base/Checkout-Begin
 * @function
 * @memberof Checkout
 * @param {middleware} - server.middleware.https
 * @param {middleware} - consentTracking.consent
 * @param {middleware} - csrfProtection.generateToken
 * @param {querystringparameter} - stage - a flag indicates the checkout stage
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.prepend(
    'Begin',
    function (req, res, next) {
        var URLUtils = require('dw/web/URLUtils');
        if (!customer.authenticated) {
            res.redirect(URLUtils.url('Cart-Show'));
        } else {
            var isAARPValidCustomer = false;
            if ((session.privacy.AARP_Member && session.privacy.AARP_Member === 'true') || (session.privacy.customerType === 'UHCVerified')) {
                isAARPValidCustomer = true;
            }
            if (!isAARPValidCustomer) {
                res.redirect(URLUtils.url('Cart-Show'));
            }
        }
        return next();
    }
);

/**
 * Checkout-ValidateAARPSubscriberId
 * @name Base/Checkout-ValidateAARPSubscriberId
 * @function
 * @memberof Checkout
 * @param {middleware} - server.middleware.https
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - post
 */
server.post('ValidateAARPSubscriberId', server.middleware.https, function (req, res, next) {
    var URLUtils = require('dw/web/URLUtils');
    var externalProfile = {};
    externalProfile.custom_attributes = {};
    externalProfile.AARP_Subscriber_ID = req.form.aarpSubscriberId;
    externalProfile.sfdcContactID = customer.getProfile().custom.sfdcContactID;
    externalProfile.fromCart = true;

    try {
        var eligibility = require('*/cartridge/scripts/helpers/eligibilityHelper');
        var responseObj = eligibility.getCustomerDetails(externalProfile);
        var Resource = require('dw/web/Resource');

        if (responseObj.error) {
            res.json({
                message: Resource.msg('aarp.no.id.found', 'cart', null),
                code: responseObj.code,
                error: true
            });
        } else {
            session.privacy.AARPSubscriberId = req.form.aarpSubscriberId;
            res.json({
                redirectUrl: URLUtils.url('Checkout-Begin').toString(),
                error: false
            });
        }
    } catch (error) {
        res.json({
            redirectUrl: URLUtils.url('Cart-Show').toString(),
            error: false
        });
    }
    next();
});

module.exports = server.exports();
