'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var somServiceMgr = proxyquire('../../../../../cartridges/plugin_ordermanagement/cartridge/scripts/services/somServiceMgr', {
    '*/cartridge/config/somPreferences': {
        somServiceID: 'Salesforce.Internal.LOM'
    },
    'dw/svc/LocalServiceRegistry': {
        createService: function () {
            return 'some service';
        }
    },
    '*/cartridge/scripts/services/somServiceDefinitions': {
        endpoints: 'some endpoints',
        definitions: {
            composite: 'some composite definitions'
        }
    }
});

describe('somServiceMgr', function () {
    describe('Endpoints', function () {
        it('should return endpoints', function () {
            assert.equal(somServiceMgr.restEndpoints, 'some endpoints');
        });
    });

    describe('composite', function () {
        it('should return composite service', function () {
            var result = somServiceMgr.restComposite();
            assert.equal(result, 'some service');
        });
    });
});
