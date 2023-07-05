'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');
var cancelOrderItemsSpy;

describe('orderHelpers.cancelOrderItems', function () {
    beforeEach(function () {
        cancelOrderItemsSpy = sinon.spy();
    });
    it('should call nested som.preCancelOrderItems method', function () {
        var orderHelpers = proxyquire('../../../../../../cartridges/plugin_ordermanagement/cartridge/scripts/order/orderHelpers', {
            'dw/web/Resource': {},
            'dw/web/URLUtils': {},
            'dw/catalog/ProductMgr': {},
            '*/cartridge/scripts/helpers/productHelpers': {},
            '*/cartridge/scripts/helpers/utilHelpers': {},
            '*/cartridge/models/product/decorators/index': {},
            '*/cartridge/scripts/som': {
                cancelOrderItems: cancelOrderItemsSpy
            },
            '*/cartridge/scripts/helpers/somHelpers': {},
            '*/cartridge/models/somOrder': {},
            'dw/system/Logger': {},
            '*/cartridge/config/somPreferences': {}
        });
        orderHelpers.cancelOrderItems({});
        assert.isTrue(cancelOrderItemsSpy.calledOnce);
    });
});
