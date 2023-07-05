'use strict';
var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn');
var OrderMgr = require('dw/order/OrderMgr');
/**
 * Middleware validating if user logged in
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next call in the middleware chain
 * @returns {void}
 */
function validateGuestOrUserLoggedIn(req, res, next) {
    var orderId = req.session.privacyCache.get('orderId');
    var orderToken = req.session.privacyCache.get('orderToken');
    if (orderId && orderToken && OrderMgr.getOrder(orderId, orderToken)) {
        next();
    } else {
        userLoggedIn.validateLoggedIn(req, res, next);
    }
}

module.exports = {
    validateGuestOrUserLoggedIn: validateGuestOrUserLoggedIn
};
