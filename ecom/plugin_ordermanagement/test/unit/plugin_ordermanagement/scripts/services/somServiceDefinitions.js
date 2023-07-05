'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var somServiceDefinitions = proxyquire('../../../../../cartridges/plugin_ordermanagement/cartridge/scripts/services/somServiceDefinitions', {
    '*/cartridge/config/somPreferences': {
        urlBegin: '/services/data/',
        version: 'v51.0',
        somCompositeEndpoints: 'composite endpoint',
        somQueryEndpoints: 'query endpoint',
        somApiEndpoints: {
            composite: 'composite endpoint',
            query: '/query endpoint',
            preCancelation: 'cancel order endpoint',
            submitCancel: 'submit cancel endpoint',
            preReturn: 'return order endpoint',
            submitReturn: 'submit return order endpoint'
        }
    },
    '*/cartridge/scripts/helpers/somHelpers': {
        expandJSON: function () {
            var body = {
                id: '12345'
            };
            return body;
        }
    }
});

describe('somServiceDefinitions', function () {
    describe('endpoints', function () {
        it('should return endpoints', function () {
            assert.equal(somServiceDefinitions.endpoints.composite, 'composite endpoint');
            assert.equal(somServiceDefinitions.endpoints.query, '/services/data/v51.0/query endpoint');
        });
    });

    describe('compositeDefinition createRequest', function () {
        it('should return request', function () {
            var svc = {
                setRequestMethod: function () {},
                addHeader: function () {},
                URL: 'myUrl'
            };

            var payload = 'my pay load';

            var result = somServiceDefinitions.definitions.composite.createRequest(svc, payload);
            assert.equal(result, 'my pay load');
        });
    });

    describe('compositeDefinition parseResponse', function () {
        it('should return parseResponse with valid JSON', function () {
            var svc = {};
            var client = {
                getResponseHeader: function () {
                    return 'application/json;abcdef';
                },
                text: 'some text',
                statusCode: 200,
                errorText: 'No error'
            };

            var result = somServiceDefinitions.definitions.composite.parseResponse(svc, client);
            assert.isTrue(result.isValidJSON);
            assert.isFalse(result.isError);
            assert.equal(result.responseObj.id, '12345');
            assert.equal(result.errorText, 'No error');
        });

        it('should return parseResponse with invalid JSON', function () {
            var svc = {};
            var client = {
                getResponseHeader: function () {
                    return 'application/html;abcdef';
                },
                text: 'text abc',
                statusCode: 400,
                errorText: 'error abc'
            };

            var result = somServiceDefinitions.definitions.composite.parseResponse(svc, client);
            assert.isFalse(result.isValidJSON);
            assert.isTrue(result.isError);
            assert.equal(result.responseObj, 'text abc');
            assert.equal(result.errorText, 'error abc');
        });
    });
});
