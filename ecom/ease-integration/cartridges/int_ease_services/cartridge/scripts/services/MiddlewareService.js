'use strict';

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Logger = require('dw/system/Logger');

var AuthToken = require('*/cartridge/scripts/services/MiddlewareAuthService');

/**
 * Create Request for Middleware API
 * @returns {dw.svc.HTTPService} HTTP service object
 */
function getMiddlewareAPIDetails() {
    return LocalServiceRegistry.createService('ease.http.middleware.get', {
        /**
         * @param {dw.svc.HTTPService} svc
         * @param {object} request object from contactus form
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
            var svcCredential = svc.getConfiguration().getCredential();
            svc.addHeader('ApiKey', svcCredential.getUser());
            return JSON.stringify(request);
        },
        /**
         *
         * @param {dw.svc.HTTPService} svc
         * @param {dw.net.HTTPClient} client
         * @returns {{responseObj: Object, isError: boolean, isValidJSON: boolean, errorText: string}}
         */
        parseResponse: function (svc, client) {
            var result;
            var response = {};

            try {
                if (client.statusMessage === 'OK') {
                    response = JSON.parse(client.text);
                } else {
                    response.error = true;
                    response.errorMessage = result.errors[0].message;
                }
            } catch (e) {
                response = client.text;
                Logger.error('Error while fetching the SF Ease Lead Service ' + e);
            }
            return response;
        },
        /**
         *
         * @param {dw.svc.HTTPService} svc
         * @param {object} contactInfo
         * @returns {{text: string, statusMessage: string, statusCode: number}}
         */
        // eslint-disable-next-line no-unused-vars
        mockCall: function (svc, contactInfo) {
            var response = {
                "resource": [
                    {
                        "dataSrc": "Brown",
                        "subNum": "E10983856-01",
                        "lastName": "Doe61021",
                        "firstName": "John61021",
                        "doB": "2/7/1966",
                        "address": "3191 W Temple Ave",
                        "city": "Pomona",
                        "state": "CA",
                        "zipCode": "91768",
                        "bStartDate": "1/1/2022",
                        "bEndDate": "12/31/2022",
                        "remBenefitAids": null,
                        "remBenefitExam": null,
                        "lookup": "Brown-Test2021",
                        "pIndex": "BFocus-10061019",
                        "subgroup_Id": null,
                        "class_ID": null,
                        "mbi": null,
                        "aciS_Plan_ID": null,
                        "tele_hearing": null
                    }
                ],
                "message": null,
                "code": null
            };
            return {
                statusCode: 200,
                statusMessage: 'Success',
                text: JSON.stringify(response)
            };
        }
    });
}

module.exports = getMiddlewareAPIDetails();
