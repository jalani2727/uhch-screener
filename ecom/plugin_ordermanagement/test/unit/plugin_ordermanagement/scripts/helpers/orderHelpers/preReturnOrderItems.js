'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var orderHelpers = proxyquire('../../../../../../cartridges/plugin_ordermanagement/cartridge/scripts/order/orderHelpers', {
    'dw/web/Resource': {},
    'dw/web/URLUtils': {},
    'dw/catalog/ProductMgr': {},
    '*/cartridge/scripts/helpers/productHelpers': {},
    '*/cartridge/scripts/helpers/utilHelpers': {},
    '*/cartridge/models/product/decorators/index': {},
    '*/cartridge/scripts/som': {
        returnOrderItems: function () {
            return { id: 'someItem' };
        }
    },
    '*/cartridge/scripts/helpers/somHelpers': {},
    '*/cartridge/models/somOrder': {},
    'dw/system/Logger': {},
    '*/cartridge/config/somPreferences': {}
});

describe('orderHelpers.returnOrderItems', function () {
    it('should return an object with property Id "someItem" when passed object with a property nonRMA that is equal to "false" ', function () {
        var result = orderHelpers.returnOrderItems([], [{ nonRMA: false }]);
        assert.equal(result.id, 'someItem');
    });
    it('should return "null" when passed object with a property nonRMA that is equal to "true" ', function () {
        var result = orderHelpers.returnOrderItems([], [{ nonRMA: true }]);
        assert.equal(result, null);
    });
});
