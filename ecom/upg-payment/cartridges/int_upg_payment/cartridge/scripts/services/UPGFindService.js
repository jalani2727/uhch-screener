'use strict';

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Logger = require('dw/system/Logger');
var Encoding = require('dw/crypto/Encoding');
var logger = Logger.getLogger('UPGError', 'upgservice');
var preferences = require('*/cartridge/config/preferences.js');
var AuthToken = require('*/cartridge/scripts/services/StargateAuthService');
/**
 * UPG Find Service API call
 * @return {Object} return the result
 */
function getService() {
    return LocalServiceRegistry.createService('upg.http.payment.find', {
        createRequest: function (svc, args) {
            return args;
        },
        parseResponse: function (svc, client) {
            return client;
        },
        filterLogMessage: function (msg) {
            return msg.replace('headers', 'UPG Find Service API Call');
        }
    });
}

/**
 * UPG Find Service API call to get the actual status of payment.
 * @param {string} transactionId - transactionId
 * @param {boolean} requestType - requestType
 * @return {Object} return the result
 */
function getTransactionDetailsService(transactionId, requestType) {
    var result;

    try {
        var service = getService();

        service.setRequestMethod('POST');
        service.addHeader('Content-Type', 'application/x-www-form-urlencoded');
        var authToken = new AuthToken();
        var token = authToken.getValidToken(requestType);
        service.addHeader('Authorization', 'Bearer ' + token.access_token);

        var svcCredential = service.getConfiguration().getCredential();
        var body = 'userName=' + Encoding.toURI(svcCredential.getUser());
        body += '&password=' + Encoding.toURI(svcCredential.getPassword());
        body += '&requestType=' + Encoding.toURI(preferences.upgRequestTypeFind);
        body += '&accountId=' + Encoding.toURI(preferences.upgAccountId);
        body += '&transactionId=' + Encoding.toURI(transactionId);

        result = service.call(body);
        return result;
    } catch (e) {
        logger.error('Error while UPG Find service call ' + e);
        return result;
    }
}

exports.getTransactionDetailsService = getTransactionDetailsService;
