/* eslint-disable no-undef */
/* eslint-disable valid-jsdoc */
'use strict';

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Logger = require('dw/system/Logger');
var Site = require('dw/system/Site');

/**
 * Create Request for Lead Creation for SF Ease
 * @returns {dw.svc.HTTPService} HTTP service object
 */
function verifyCaptcha() {
    return LocalServiceRegistry.createService('uhc.http.google.recaptcha', {
        /**
         * @param {dw.svc.HTTPService} svc
         * @param {object} contactInfo object from contactus form
         * @returns {string} request body
         */
        createRequest: function (svc, token) {
            svc.setRequestMethod('POST');
            var curSite = Site.getCurrent();
            var secretKey = curSite.getCustomPreferenceValue('recaptchSiteSecret');
            var svcCredential = svc.getConfiguration().getCredential();
            // Forming a URL with token added after user checks in
            var verificationURL = svcCredential.URL + '?secret=' + secretKey + '&response=' + token;
            svc.setURL(verificationURL);
            return {};
        },
        /**
         *
         * @param {dw.svc.HTTPService} svc
         * @param {dw.net.HTTPClient} client
         * @returns {{responseObj: Object, isError: boolean, isValidJSON: boolean, errorText: string}}
         */
        parseResponse: function (svc, client) {
            var response = false;
            try {
                response = JSON.parse(client.text);
            } catch (e) {
                response = false;
                Logger.error('Error while fetching the SF Ease Lead Service ' + e);
            }
            return response;
        },

        // eslint-disable-next-line no-unused-vars
        mockCall: function (svc, token) {
            var response = true;
            return {
                statusCode: 200,
                statusMessage: 'Success',
                text: response
            };
        }
    });
}

// execute and return the created instance
module.exports = verifyCaptcha();
