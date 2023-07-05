'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var somHelpers = proxyquire('../../../../../../cartridges/plugin_ordermanagement/cartridge/scripts/helpers/somHelpers', {
    '*/cartridge/scripts/helpers/utilHelpers': {
        calculateTotalPrice: function (unitPrice, quantity) {
            var total = unitPrice * quantity;
            return total;
        }
    },
    '*/cartridge/config/somPreferences': {
        statusInProgress: 'InProgress',
        statusShipped: 'Shipped'
    }
});


describe('somHelpers.getNoneFulfillOrderLineItems', function () {
    describe('should return a list of fulfillment orders that has not been fulfilled when hasFulfillment is false', function () {
        var orderItemSummaries = [
            {
                Id: '100001',
                ProductCode: 'productCode1',
                Quantity: 1,
                UnitPrice: 15,
                TotalPrice: 15.00
            },
            {
                Id: '100002',
                ProductCode: 'productCode2',
                Quantity: 2,
                UnitPrice: 10,
                TotalPrice: 20.00
            }
        ];
        var config = {
            orderItemSummaries: orderItemSummaries,
            currencyCode: 'USD',
            hasFulfillment: false
        };

        it('The array returned should has a length of 2', function () {
            var items = somHelpers.getNoneFulfillOrderLineItems(config);
            assert.lengthOf(items, 2);
        });

        it('The orderItemSummaryId property of the first item of array should be equal to "100001"', function () {
            var items = somHelpers.getNoneFulfillOrderLineItems(config);
            assert.equal(items[0].orderItemSummaryId, '100001');
        });

        it('The currencyCode property of the first item of array should be equal to "USD"', function () {
            var items = somHelpers.getNoneFulfillOrderLineItems(config);
            assert.equal(items[0].currencyCode, 'USD');
        });

        it('The sfccProductId property of the first item of array should be equal to "productCode1"', function () {
            var items = somHelpers.getNoneFulfillOrderLineItems(config);
            assert.equal(items[0].sfccProductId, 'productCode1');
        });

        it('The fulfillmentOrderLineItemId property of the first item of array should be equal to "null"', function () {
            var items = somHelpers.getNoneFulfillOrderLineItems(config);
            assert.isNull(items[0].fulfillmentOrderLineItemId);
        });

        it('The quantity property of the first item of array should be equal to "1"', function () {
            var items = somHelpers.getNoneFulfillOrderLineItems(config);
            assert.equal(items[0].quantity, 1);
        });

        it('The totalPrice property of the first item of array should be equal to "15"', function () {
            var items = somHelpers.getNoneFulfillOrderLineItems(config);
            assert.equal(items[0].totalPrice, 15);
        });

        it('The orderItemSummaryId property of the second item of array should be equal to "100001"', function () {
            var items = somHelpers.getNoneFulfillOrderLineItems(config);
            assert.equal(items[1].orderItemSummaryId, '100002');
        });

        it('The currencyCode property of the second item of array should be equal to "USD"', function () {
            var items = somHelpers.getNoneFulfillOrderLineItems(config);
            assert.equal(items[1].currencyCode, 'USD');
        });

        it('The sfccProductId property of the second item of array should be equal to "productCode1"', function () {
            var items = somHelpers.getNoneFulfillOrderLineItems(config);
            assert.equal(items[1].sfccProductId, 'productCode2');
        });

        it('The fulfillmentOrderLineItemId property of the second item of array should be equal to "null"', function () {
            var items = somHelpers.getNoneFulfillOrderLineItems(config);
            assert.isNull(items[1].fulfillmentOrderLineItemId);
        });

        it('The quantity property of the second item of array should be equal to "1"', function () {
            var items = somHelpers.getNoneFulfillOrderLineItems(config);
            assert.equal(items[1].quantity, 2);
        });

        it('The totalPrice property of the second item of array should be equal to "15"', function () {
            var items = somHelpers.getNoneFulfillOrderLineItems(config);
            assert.equal(items[1].totalPrice, 20);
        });
    });

    describe('should return a list of fulfillment orders that has not been fulfilled when hasFulfillment is true', function () {
        var orderItemSummaries = [
            {
                Id: '100001',
                ProductCode: 'productCode1',
                QuantityAvailableToFulfill: 1,
                UnitPrice: 15.00
            },
            {
                Id: '100002',
                ProductCode: 'productCode2',
                QuantityAvailableToFulfill: 0,
                UnitPrice: 50.00
            },
            {
                Id: '100003',
                ProductCode: 'productCode3',
                QuantityAvailableToFulfill: 2,
                UnitPrice: 10.00
            }
        ];

        var config = {
            orderItemSummaries: orderItemSummaries,
            currencyCode: 'USD',
            hasFulfillment: true
        };


        it('The array returned should has a length of 2', function () {
            var items = somHelpers.getNoneFulfillOrderLineItems(config);
            assert.lengthOf(items, 2);
        });

        it('The orderItemSummaryId property of the first item of array should be equal to "100001"', function () {
            var items = somHelpers.getNoneFulfillOrderLineItems(config);
            assert.equal(items[0].orderItemSummaryId, '100001');
        });

        it('The currencyCode property of the first item of array should be equal to "USD"', function () {
            var items = somHelpers.getNoneFulfillOrderLineItems(config);
            assert.equal(items[0].currencyCode, 'USD');
        });

        it('The sfccProductId property of the first item of array should be equal to "productCode1"', function () {
            var items = somHelpers.getNoneFulfillOrderLineItems(config);
            assert.equal(items[0].sfccProductId, 'productCode1');
        });

        it('The fulfillmentOrderLineItemId property of the first item of array should be equal to "null"', function () {
            var items = somHelpers.getNoneFulfillOrderLineItems(config);
            assert.isNull(items[0].fulfillmentOrderLineItemId);
        });

        it('The quantity property of the first item of array should be equal to "1"', function () {
            var items = somHelpers.getNoneFulfillOrderLineItems(config);
            assert.equal(items[0].quantity, 1);
        });

        it('The totalPrice property of the first item of array should be equal to "15"', function () {
            var items = somHelpers.getNoneFulfillOrderLineItems(config);
            assert.equal(items[0].totalPrice, 15);
        });

        it('The orderItemSummaryId property of the second item of array should be equal to "100003"', function () {
            var items = somHelpers.getNoneFulfillOrderLineItems(config);
            assert.equal(items[1].orderItemSummaryId, '100003');
        });

        it('The currencyCode property of the second item of array should be equal to "USD"', function () {
            var items = somHelpers.getNoneFulfillOrderLineItems(config);
            assert.equal(items[1].currencyCode, 'USD');
        });

        it('The sfccProductId property of the second item of array should be equal to "productCode1"', function () {
            var items = somHelpers.getNoneFulfillOrderLineItems(config);
            assert.equal(items[1].sfccProductId, 'productCode3');
        });

        it('The fulfillmentOrderLineItemId property of the second item of array should be equal to "null"', function () {
            var items = somHelpers.getNoneFulfillOrderLineItems(config);
            assert.isNull(items[1].fulfillmentOrderLineItemId);
        });

        it('The quantity property of the second item of array should be equal to "1"', function () {
            var items = somHelpers.getNoneFulfillOrderLineItems(config);
            assert.equal(items[1].quantity, 2);
        });

        it('The totalPrice property of the second item of array should be equal to "15"', function () {
            var items = somHelpers.getNoneFulfillOrderLineItems(config);
            assert.equal(items[1].totalPrice, 20);
        });
    });
});
