/* eslint-disable no-undef */
/* eslint-disable valid-jsdoc */
'use strict';

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Logger = require('dw/system/Logger');
var AuthToken = require('*/cartridge/scripts/services/EaseAuthService');
/**
 * Create Request for invoice lookup in SF Ease
 * @returns {dw.svc.HTTPService} HTTP service object
 */
function getInvoiceDetails() {
    return LocalServiceRegistry.createService('ease.http.invoicelookup.get', {
        /**
         * @param {dw.svc.HTTPService} svc
         * @param {object} request object from paymentLookup form
         * @param {boolean} requestType - requestType
         * @returns {string} request body
         */
        createRequest: function (svc, request, requestType) {
            svc.addHeader('Content-Type', 'application/json');
            svc.addHeader('Accept', 'application/json');
            svc.setRequestMethod('POST');
            var authToken = new AuthToken();
            var token = authToken.getValidToken(requestType);
            var bearerToken = 'Bearer ' + token.access_token;
            svc.addHeader('Authorization', bearerToken);
            return JSON.stringify(request);
        },
        /**
         *
         * @param {dw.svc.HTTPService} svc
         * @param {dw.net.HTTPClient} client
         * @returns response: Object
         */
        parseResponse: function (svc, client) {
            var response = {};
            try {
                if (client.statusMessage === 'OK') {
                    response = JSON.parse(client.text);
                } else {
                    response.error = true;
                }
            } catch (e) {
                response = JSON.parse(client.text);
                Logger.error('Error while fetching the SF Ease invoice Service ' + e);
            }
            return response;
        },
        /**
         *
         * @param {dw.svc.HTTPService} svc
         * @param {object} request
         * @returns {{text: object, statusMessage: string, statusCode: number}}
         */
        // eslint-disable-next-line no-unused-vars
        mockCall: function (svc, request) {
            var response = '{"statusMsg":"Success","statusCode":0,"invoiceData":{"products":[{"quantity":1,"productName":"Serenity Choice Music","color":null},{"quantity":1,"productName":"SHIPPING","color":null}],"patientName":"Aman Ranga","opportunityId":"006DC00000FSdQwYAL","memberEmailAddress":null,"invoiceRecordId":"a09DC000001hwg8YAA","invoiceId":"001439445","invoiceBalance":50,"dob":"1953-07-15"}}';
            return {
                statusCode: 200,
                statusMessage: 'OK',
                text: response
            };
        }
    });
}

// execute and return the created instance
module.exports = getInvoiceDetails();
