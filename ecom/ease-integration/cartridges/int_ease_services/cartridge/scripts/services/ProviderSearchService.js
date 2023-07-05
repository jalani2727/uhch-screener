/* eslint-disable no-undef */
/* eslint-disable valid-jsdoc */
'use strict';

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Logger = require('dw/system/Logger');
var AuthToken = require('*/cartridge/scripts/services/EaseAuthService');

/**
 * Create Request for Provider details
 * @returns {dw.svc.HTTPService} HTTP service object
 */
function getProviderDetails() {
    return LocalServiceRegistry.createService('ease.http.provider.search', {
        /**
         * @returns {string} request body
         */
        createRequest: function (svc, zipCode, radius, stateCode, requestType) {
            svc.addHeader('Content-Type', 'application/json');
            svc.addHeader('Accept', 'application/json');
            svc.setRequestMethod('POST');
            var requestBody = {
                zipCode: zipCode,
                radius: radius,
                stateCode: stateCode
            };
            var authToken = new AuthToken();
            var token = authToken.getValidToken(requestType);
            var bearerToken = 'Bearer ' + token.access_token;
            svc.addHeader('Authorization', bearerToken);
            return JSON.stringify(requestBody);
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
          // eslint-disable-next-line no-unused-vars
        mockCall: function (svc, contactInfo) {
            var response = {
                practices: [
                    {
                        providers: [
                            {
                                services: [
                                    'pediatrics',
                                    'mobile'
                                ],
                                ReverseReferralOnly: true,
                                providerName: 'test provider1',
                                NPI: null,
                                licensetype: [
                                    'Audiologist',
                                    'AuD'
                                ],
                                languages: [
                                    'English'
                                ],
                                gender: null
                            },
                            {
                                services: [
                                    'mobile',
                                    'inOfficePayment'
                                ],
                                ReverseReferralOnly: false,
                                providerName: 'sample provider',
                                NPI: null,
                                licensetype: [
                                    'Audiologist'
                                ],
                                languages: [
                                    'English'
                                ],
                                gender: null
                            },
                            {
                                services: [
                                    'pediatrics'
                                ],
                                ReverseReferralOnly: false,
                                providerName: 'test 2 t test 2 t',
                                NPI: null,
                                licensetype: [
                                    'Audiologist'
                                ],
                                languages: [
                                    'English'
                                ],
                                gender: null
                            },
                            {
                                services: [
                                    'pediatrics',
                                    'mobile',
                                    'inOfficePayment'
                                ],
                                ReverseReferralOnly: false,
                                providerName: 'vijay salesforce',
                                NPI: null,
                                licensetype: [
                                    'Audiologist',
                                    'AuD'
                                ],
                                languages: [
                                    'Spanish',
                                    'English'
                                ],
                                gender: null
                            },
                            {
                                services: [
                                    'pediatrics',
                                    'mobile'
                                ],
                                ReverseReferralOnly: true,
                                providerName: 'test provider',
                                NPI: null,
                                licensetype: [
                                    'Audiologist',
                                    'AuD'
                                ],
                                languages: [
                                    'English'
                                ],
                                gender: null
                            },
                            {
                                services: [
                                    'pediatrics',
                                    'mobile',
                                    'inOfficePayment'
                                ],
                                ReverseReferralOnly: false,
                                providerName: 'vijayy salesforcee',
                                NPI: null,
                                licensetype: [
                                    'Audiologist',
                                    'AuD'
                                ],
                                languages: [
                                    'Spanish',
                                    'English'
                                ],
                                gender: null
                            },
                            {
                                services: [
                                    'pediatrics'
                                ],
                                ReverseReferralOnly: false,
                                providerName: 'Test Provider01',
                                NPI: null,
                                licensetype: [
                                    'Audiologist'
                                ],
                                languages: [
                                    'English'
                                ],
                                gender: null
                            },
                            {
                                services: [
                                    'pediatrics'
                                ],
                                ReverseReferralOnly: false,
                                providerName: 'test contact155',
                                NPI: null,
                                licensetype: [
                                    'Audiologist'
                                ],
                                languages: [
                                    'English'
                                ],
                                gender: null
                            },
                            {
                                services: [
                                    'pediatrics'
                                ],
                                ReverseReferralOnly: false,
                                providerName: 'test1 t test1 t',
                                NPI: null,
                                licensetype: [
                                    'Audiologist'
                                ],
                                languages: [
                                    'English'
                                ],
                                gender: null
                            },
                            {
                                services: [
                                    'pediatrics'
                                ],
                                ReverseReferralOnly: false,
                                providerName: 'test contact111',
                                NPI: null,
                                licensetype: [
                                    'Audiologist'
                                ],
                                languages: [
                                    'English'
                                ],
                                gender: null
                            }
                        ],
                        PreferredTier: 'New',
                        practiceName: 'Audibel Hearing Aid Center',
                        practiceId: 'P-653903',
                        phone: '1-866-956-5400',
                        longitude: -121.513121100000000,
                        latitude: 45.708541700000000,
                        hours: '22 hrs',
                        distance: 7.373939175857648,
                        brand: [
                            'Phonak',
                            'Beltone',
                            'Cochlear',
                            'Emtech',
                            'Unitron',
                            'Siemens',
                            'Starkey',
                            'Relate'
                        ],
                        address: 'HOOD RIVER OR 97031-2389'
                    },
                    {
                        providers: [
                            {
                                services: [
                                    'pediatrics'
                                ],
                                ReverseReferralOnly: false,
                                providerName: 'test prov2',
                                NPI: null,
                                licensetype: [
                                    'Audiologist'
                                ],
                                languages: [
                                    'English'
                                ],
                                gender: null
                            },
                            {
                                services: [
                                    'pediatrics'
                                ],
                                ReverseReferralOnly: false,
                                providerName: 'test prov1',
                                NPI: null,
                                licensetype: [
                                    'Audiologist'
                                ],
                                languages: [
                                    'English'
                                ],
                                gender: null
                            }
                        ],
                        PreferredTier: 'New',
                        practiceName: 'Audiolgy Consulting Services',
                        practiceId: 'P-653913',
                        phone: '1-866-956-5400',
                        longitude: -121.523672000000000,
                        latitude: 45.704129200000000,
                        hours: '22 hrs',
                        distance: 6.807063587340056,
                        brand: [
                            'Oticon',
                            'Resound',
                            'Starkey',
                            'Relate'
                        ],
                        address: 'HOOD RIVER OR 97031-1588'
                    }
                ]

            };
            return {
                statusCode: 200,
                ok: true,
                statusMessage: 'Success',
                text: response
            };
        }
    });
}

// execute and return the created instance
module.exports = getProviderDetails();
