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
    '*/cartridge/config/somPreferences': {
        statusOrdered: 'Ordered',
        statusInProgress: 'InProgress',
        statusShipped: 'Shipped'
    }
});

describe('orderHelpers.getFulfillmentStatus', function () {
    it('should return a string that is equal to "Ordered" when orderedStatusGroupItems is not an empty array', function () {
        var result = orderHelpers.getFulfillmentStatus({ orderedStatusGroupItems: [{}], inProgressStatusGroupItems: [], shippedStatusGroupItems: [] });
        assert.equal(result, 'Ordered');
    });
    it('should return a string that is equal to "InProgress" when inProgressStatusGroupItems is not an empty array', function () {
        var result = orderHelpers.getFulfillmentStatus({ orderedStatusGroupItems: [], inProgressStatusGroupItems: [{}], shippedStatusGroupItems: [] });
        assert.equal(result, 'InProgress');
    });
    it('should return a string that is equal to "Shipped" when shippedStatusGroupItems is not an empty array', function () {
        var result = orderHelpers.getFulfillmentStatus({ orderedStatusGroupItems: [], inProgressStatusGroupItems: [], shippedStatusGroupItems: [{}] });
        assert.equal(result, 'Shipped');
    });
    it('should return a string that is equal to "-" when all arrays are empty', function () {
        var result = orderHelpers.getFulfillmentStatus({ orderedStatusGroupItems: [], inProgressStatusGroupItems: [], shippedStatusGroupItems: [] });
        assert.equal(result, '');
    });
});
