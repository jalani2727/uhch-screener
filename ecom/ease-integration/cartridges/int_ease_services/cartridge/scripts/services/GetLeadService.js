/* eslint-disable no-undef */
/* eslint-disable valid-jsdoc */
'use strict';

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Logger = require('dw/system/Logger');
var AuthToken = require('*/cartridge/scripts/services/EaseAuthService');
/**
 * Create Request for Lead Creation for SF Ease
 * @returns {dw.svc.HTTPService} HTTP service object
 */
function getLead() {
    return LocalServiceRegistry.createService('ease.http.create.lead', {
        /**
         * @param {dw.svc.HTTPService} svc
         * @param {object} resultId object from contactus form
         * @param {boolean} requestType - requestType
         * @returns {string} request body
         */
        createRequest: function (svc, resultId, requestType) {
            svc.addHeader('Content-Type', 'application/json');
            svc.addHeader('Accept', 'application/json');
            svc.setRequestMethod('GET');
            var authToken = new AuthToken();
            var token = authToken.getValidToken(requestType);
            var bearerToken = 'Bearer ' + token.access_token;
            svc.addHeader('Authorization', bearerToken);
            var svcCredential = svc.getConfiguration().getCredential();
            var leadURL = svcCredential.URL + resultId;
            svc.setURL(leadURL);
            return {};
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
            var response = { resultId: null,
                message: 'Lead has been created Successfully.',
                lead: { zipCode: '75063',
                    updatedBy: 'Ecom',
                    transId: null,
                    street: '123 test dr',
                    state: 'TX',
                    screenerStatus: null,
                    resultId: null,
                    registrationStatus: null,
                    questOutcome: null,
                    questionairreStatus: null,
                    questAnswer4: { option5: false,
                        option4: false,
                        option3: false,
                        option2: false,
                        option1: false },
                    questAnswer3: null,
                    questAnswer2: null,
                    questAnswer1: null,
                    providerName: null,
                    phone: '546-886-8700',
                    otherInsurance: null,
                    oapResult: null,
                    oapQuest4Weight: null,
                    leadID: '00Q59000003i7KVEAY',
                    lastName: 'DOC123167',
                    isAuthenticated: false,
                    healthPlanMemberID: null,
                    healthPlanInsurer: null,
                    firstName: 'TESTC43235',
                    email: 'test@test514.com',
                    dob: '2020-04-05',
                    createdDateTime: '2022-05-23T09:59:32.000Z',
                    commentsContacUs: 'test comments',
                    city: 'Irving',
                    careOutcome: null,
                    brandingID: null },
                isSuccess: true,
                hearing: null
            };
            return {
                statusCode: 200,
                statusMessage: 'Success',
                text: JSON.stringify(response)
            };
        }
    });
}

// execute and return the created instance
module.exports = getLead();
