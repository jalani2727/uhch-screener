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
    '*/cartridge/scripts/som': {},
    '*/cartridge/scripts/helpers/somHelpers': {},
    '*/cartridge/models/somOrder': {},
    'dw/system/Logger': {},
    '*/cartridge/config/somPreferences': {}
});

describe('orderHelpers.isNonRMA', function () {
    it('should return "true" when passed object with a property nonRMA that is equal to "true" ', function () {
        var result = orderHelpers.isNonRMA([{ nonRMA: true }]);
        assert.equal(result, true);
    });
    it('should return "false" when passed object with a property nonRMA that is equal to "false" ', function () {
        var result = orderHelpers.isNonRMA([{ nonRMA: false }]);
        assert.equal(result, false);
    });
    it('should return "true" when passed an array objects with properties [{ nonRMA: false }, { nonRMA: true }]', function () {
        var result = orderHelpers.isNonRMA([{ nonRMA: false }, { nonRMA: true }]);
        assert.equal(result, true);
    });
});
