/* eslint-disable no-undef */
/* eslint-disable valid-jsdoc */
'use strict';

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Site = require('dw/system/Site');
var UPSHelper = require('*/cartridge/scripts/helpers/UPSHelper');
var Logger = require('dw/system/Logger');

var userAddress;
/**
 * Create Request for UPS Address validation
 * @returns {dw.svc.HTTPService} HTTP service object
 */
function validateAddress() {
    return LocalServiceRegistry.createService('ups.http.address.validation', {
        /**
         * @param {dw.svc.HTTPService} svc
         * @param {Address} address
         * @returns {string} request body
         */
        createRequest: function (svc, address) {
            svc.addHeader('Content-Type', 'application/json');
            svc.addHeader('Accept', 'application/json');
            svc.setRequestMethod('POST');
            var curSite = Site.getCurrent();
            var accessKey = curSite.getCustomPreferenceValue('upsAccessKey');
            if (empty(accessKey)) {
                throw new Error(
                    'UPS service configuration requires valid access key in Site custom preferences'
                );
            }
            var svcCredential = svc.getConfiguration().getCredential();
            var username = svcCredential.getUser();
            var password = svcCredential.getPassword();
            if(address.address2){
                userAddress = address.address1 + ", " + address.address2;
            }
            else{
                userAddress = address.address1;
            }
            if (empty(username) || empty(password)) {
                throw new Error(
                    'UPS service configuration requires valid client username and password in Service Credentials'
                );
            }
            svc.addHeader('AccessLicenseNumber', accessKey); // UPS access Licence key
            svc.addHeader('Username', username); // MyUPS username
            svc.addHeader('Password', password); // MyUPS password

            var requestBody = {
                XAVRequest: {
                    AddressKeyFormat: {
                        AddressLine: [userAddress],
                        ConsigneeName: 'Consignee Name',
                        BuildingName: 'Building Name',
                        PoliticalDivision2: address.city,
                        PoliticalDivision1: address.stateCode,
                        PostcodePrimaryLow: address.postalCode,
                        CountryCode: address.countryCode,
                        PostcodeExtendedLow: '',
                        Urbanization: ''
                    }
                }
            };
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
                    result = JSON.parse(client.text);
                    var XAVResponse = result.XAVResponse;
                    var isValid = UPSHelper.getAddressIndicator(XAVResponse); // This will check type of address Validation for provided address
                    if (!isValid) {
                        response.valid = false;
                        var candidateAddress = 'Candidate' in XAVResponse && XAVResponse.Candidate.length > 0 ?
                            XAVResponse.Candidate[0].AddressKeyFormat :
                            {}; // Even though multiple address suggestions are available taking the first response
                        if ('NoCandidatesIndicator' in XAVResponse) {
                            response.address = null;
                        } else {
                            response.address = UPSHelper.getAddressObject(candidateAddress, userAddress);
                        }
                    } else {
                        response.valid = true;
                        response.address = UPSHelper.getAddressObject(XAVResponse.Candidate.AddressKeyFormat, userAddress);
                    }
                } else {
                    response.error = true;
                    response.errorMessage = result.errors[0].message;
                }
            } catch (e) {
                response = client.text;
                Logger.error('Error while fetching the UPS Service ' + e);
            }
            return response;
        },
        /**
         *
         * @param {dw.svc.HTTPService} svc
         * @param {Address} address
         * @returns {{text: string, statusMessage: string, statusCode: number}}
         */
        // eslint-disable-next-line no-unused-vars
        mockCall: function (svc, address) {
            var response = {
                XAVResponse: {
                    Response: {
                        ResponseStatus: {
                            Code: '1',
                            Description: 'Success'
                        }
                    },
                    ValidAddressIndicator: '',
                    Candidate: {
                        AddressKeyFormat: {
                            AddressLine: '12380 MORRIS RD',
                            PoliticalDivision2: 'ALPHARETTA',
                            PoliticalDivision1: 'GA',
                            PostcodePrimaryLow: '30005',
                            PostcodeExtendedLow: '4616',
                            Region: 'ALPHARETTA GA 30005-4616',
                            CountryCode: 'US'
                        }
                    }
                }
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
module.exports = validateAddress();
