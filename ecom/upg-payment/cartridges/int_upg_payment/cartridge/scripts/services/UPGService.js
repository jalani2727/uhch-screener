'use strict';

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Logger = require('dw/system/Logger');
var Encoding = require('dw/crypto/Encoding');
var logger = Logger.getLogger('UPGError', 'upgservice');
var preferences = require('*/cartridge/config/preferences.js');
var AuthToken = require('*/cartridge/scripts/services/StargateAuthService');

/**
 * UPG Service.
 * @return {Object} return the result
 */
function getService() {
    return LocalServiceRegistry.createService('upg.http.payment.get', {
        createRequest: function (svc, args) {
            return args;
        },
        parseResponse: function (svc, client) {
            return client;
        },
        filterLogMessage: function (msg) {
            return msg.replace('headers', 'UPG Service API Call');
        }
    });
}

/**
 * UPG Service API call for getting the request ID.
 * @param {string} returnURL - returnURL
 * @param {string} cancelURL - cancelURL
 * @param {number} totalGrossPrice - totalGrossPrice.
 * @param {boolean} requestType - requestType
 * @return {Object} return the result
 */
function getServiceObj(returnURL, cancelURL, totalGrossPrice, requestType, paymentPortal) {
    var result;
    try {
        var service = getService();
        service.setRequestMethod('POST');
        service.addHeader('Content-Type', 'application/x-www-form-urlencoded');
        var authToken = new AuthToken();
        var token = authToken.getValidToken(requestType);
        service.addHeader('Authorization', 'Bearer ' + token.access_token);

        if (paymentPortal) {
            var svcCredential = service.getConfiguration().getCredential();
            var body = 'userName=' + Encoding.toURI(svcCredential.getUser());
            body += '&password=' + Encoding.toURI(svcCredential.getPassword());
            body += '&requestType=' + Encoding.toURI(preferences.upgRequestTypeAuth_PP);
            body += '&accountId=' + Encoding.toURI(preferences.upgAccountId_PP);
            body += '&processingMode=' + Encoding.toURI(preferences.upgProcessingMode_PP);
            body += '&transactionIndustryType=' + Encoding.toURI(preferences.upgTransactionIndustryType_PP);
            body += '&notifyURL=' + Encoding.toURI(preferences.upgNotifyURL_PP);
            body += '&returnURLPolicy=' + Encoding.toURI(preferences.upgReturnURLPolicy_PP);
            body += '&returnURL=' + Encoding.toURI(returnURL);
            body += '&cancelURL=' + Encoding.toURI(cancelURL);
            body += '&amount=' + totalGrossPrice;
            body += '&accountType=' + Encoding.toURI(preferences.upgAccountType_PP);
            body += '&styleURL=' + Encoding.toURI(preferences.upgStyleURL_PP);
            body += '&parsedData=' + Encoding.toURI(preferences.upgParsedData_PP);
            
        } else {
            var svcCredential = service.getConfiguration().getCredential();
            var body = 'userName=' + Encoding.toURI(svcCredential.getUser());
            body += '&password=' + Encoding.toURI(svcCredential.getPassword());
            body += '&requestType=' + Encoding.toURI(preferences.upgRequestTypeAuth);
            body += '&accountId=' + Encoding.toURI(preferences.upgAccountId);
            body += '&processingMode=' + Encoding.toURI(preferences.upgProcessingMode);
            body += '&transactionIndustryType=' + Encoding.toURI(preferences.upgTransactionIndustryType);
            body += '&notifyURL=' + Encoding.toURI(preferences.upgNotifyURL);
            body += '&returnURLPolicy=' + Encoding.toURI(preferences.upgReturnURLPolicy);
            body += '&returnURL=' + Encoding.toURI(returnURL);
            body += '&cancelURL=' + Encoding.toURI(cancelURL);
            body += '&amount=' + totalGrossPrice;
            body += '&accountType=' + Encoding.toURI(preferences.upgAccountType);
            body += '&styleURL=' + Encoding.toURI(preferences.upgStyleURL);
            body += '&parsedData=' + Encoding.toURI(preferences.upgParsedData);   
        }

        result = service.call(body);
    } catch (e) {
        logger.error('Error while UPG service call ' + e);
    }
    return result;
}

exports.getServiceObj = getServiceObj;
