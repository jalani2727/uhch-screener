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

var propertiesNames = {
    orderSummaries: 'orderSummaries',
    orderSummaryToOrderItemSummaries: 'orderSummaryToOrderItemSummaries',
    orderSummaryToOrderDeliveryGroupSummaries: 'orderSummaryToOrderDeliveryGroupSummaries',
    orderSummaryToOrderPaymentSummaries: 'orderSummaryToOrderPaymentSummaries'
};

var somOrderSummaries = {
    body: {
        records: [{
            attributes: { type: 'OrderSummary' },
            Id: '1OrderSumary1',
            OrderItemSummaries: {
                records: [{
                    attributes: { type: 'OrderItemSummary' },
                    Id: '1OS1orderItemSumary1'
                }, {
                    attributes: { type: 'OrderItemSummary' },
                    Id: '1OS1orderItemSumary2'
                }, {
                    attributes: { type: 'OrderItemSummary' },
                    Id: '1OS1orderItemSumary3'
                }]
            },
            OrderDeliveryGroupSummaries: {
                records: [{
                    attributes: { type: 'OrderDeliveryGroupSummary' },
                    Id: '1OS1orderDeliveryGroupSumary1'
                }, {
                    attributes: { type: 'OrderDeliveryGroupSummary' },
                    Id: '1OS1orderDeliveryGroupSumary2'
                }]
            },
            OrderPaymentSummaries: {
                records: [{
                    attributes: { type: 'OrderPaymentSummary' },
                    Id: '1OS1orderPaymentSumary1'
                }]
            }
        }, {
            attributes: { type: 'OrderSummary' },
            Id: '1OrderSumary2',
            OrderItemSummaries: {
                records: [{
                    attributes: { type: 'OrderItemSummary' },
                    Id: '1OS2orderItemSumary1'
                }]
            },
            OrderDeliveryGroupSummaries: {
                records: [{
                    attributes: { type: 'OrderDeliveryGroupSummary' },
                    Id: '1OS2orderDeliveryGroupSumary1'
                }]
            }
        }]
    }
};

var somOrderPayment = {
    'body': {
        'totalSize': 1,
        'done': true,
        'records': [{
            'Id': '1OS1orderPaymentSumary1',
            'DisplayCardNumber': '************1111',
            'CardHolderName': 'Test Test',
            'ExpiryMonth': 12,
            'ExpiryYear': 2023,
            'CardCategory': 'CreditCard',
            'CardType': 'Visa',
            'CardTypeCategory': 'Visa'
        }]
    }
};


describe('somHelpers.createOrderSummaryMapObjects', function () {
    describe('Should contain required keys', function () {
        it('Should return an object that contains the "orderSummaries" property', function () {
            var mappingObjects = somHelpers.createOrderSummaryMapObjects(somOrderSummaries);
            assert.property(mappingObjects, propertiesNames.orderSummaries);
        });

        it('Should return an object that contains the "orderSummaryToOrderItemSummaries" property', function () {
            var mappingObjects = somHelpers.createOrderSummaryMapObjects(somOrderSummaries);
            assert.property(mappingObjects, propertiesNames.orderSummaryToOrderItemSummaries);
        });

        it('Should return an object that contains the "orderSummaryToOrderDeliveryGroupSummaries" property', function () {
            var mappingObjects = somHelpers.createOrderSummaryMapObjects(somOrderSummaries);
            assert.property(mappingObjects, propertiesNames.orderSummaryToOrderDeliveryGroupSummaries);
        });
    });

    describe('The "orderSummaries" property should contain required keys', function () {
        it('Should return an object with the "orderSummaries" property that contains the "_1OrderSumary1" property', function () {
            var mappingObjects = somHelpers.createOrderSummaryMapObjects(somOrderSummaries);
            assert.property(mappingObjects, propertiesNames.orderSummaries, '_1OrderSumary1');
        });

        it('Should return an object with the "orderSummaries" property that contains the "_1OrderSumary2" property', function () {
            var mappingObjects = somHelpers.createOrderSummaryMapObjects(somOrderSummaries);
            assert.property(mappingObjects, propertiesNames.orderSummaries, '_1OrderSumary2');
        });

        it('An "orderSummaries" object should contain the "_1OrderSumary1" with a nested property Id that is equal to "1OrderSumary1"', function () {
            var mappingObjects = somHelpers.createOrderSummaryMapObjects(somOrderSummaries);
            // eslint-disable-next-line no-underscore-dangle
            assert.propertyVal(mappingObjects.orderSummaries._1OrderSumary1, 'Id', '1OrderSumary1');
        });

        it('An "orderSummaries" object should contain the "_1OrderSumary2" with a nested property Id that is equal to "1OrderSumary2"', function () {
            var mappingObjects = somHelpers.createOrderSummaryMapObjects(somOrderSummaries);
            // eslint-disable-next-line no-underscore-dangle
            assert.propertyVal(mappingObjects.orderSummaries._1OrderSumary2, 'Id', '1OrderSumary2');
        });
    });

    describe('Verify the mapping between OrderSummary and OrderItemSummary', function () {
        it('Should return an object with the "orderSummaries" property that contains the "_1OrderSumary1" property', function () {
            var mappingObjects = somHelpers.createOrderSummaryMapObjects(somOrderSummaries);
            assert.property(mappingObjects.orderSummaryToOrderItemSummaries, '_1OrderSumary1');
        });

        it('Should return an object with the "orderSummaries" property that contains the "_1OrderSumary2" property', function () {
            var mappingObjects = somHelpers.createOrderSummaryMapObjects(somOrderSummaries);
            assert.property(mappingObjects.orderSummaryToOrderItemSummaries, '_1OrderSumary2');
        });

        it('orderSummaryToOrderItemSummaries object with  _1OrderSumary1 nested property that contains "1OS1orderItemSumary1", "1OS1orderItemSumary2", "1OS1orderItemSumary3" keys ', function () {
            var mappingObjects = somHelpers.createOrderSummaryMapObjects(somOrderSummaries);
            // eslint-disable-next-line no-underscore-dangle
            assert.containsAllKeys(mappingObjects.orderSummaryToOrderItemSummaries._1OrderSumary1, ['_1OS1orderItemSumary1', '_1OS1orderItemSumary2', '_1OS1orderItemSumary3']);
        });

        it('An "orderSummaryToOrderItemSummaries" object should contain the "_1OS1orderItemSumary2" with a nested property Id that is equal to "1OS1orderItemSumary1"', function () {
            var mappingObjects = somHelpers.createOrderSummaryMapObjects(somOrderSummaries);
            // eslint-disable-next-line no-underscore-dangle
            assert.propertyVal(mappingObjects.orderSummaryToOrderItemSummaries._1OrderSumary1._1OS1orderItemSumary1, 'Id', '1OS1orderItemSumary1');
        });

        it('An "orderSummaryToOrderItemSummaries" object should contain the "_1OS1orderItemSumary2" with a nested property Id that is equal to "1OS1orderItemSumary2"', function () {
            var mappingObjects = somHelpers.createOrderSummaryMapObjects(somOrderSummaries);
            // eslint-disable-next-line no-underscore-dangle
            assert.propertyVal(mappingObjects.orderSummaryToOrderItemSummaries._1OrderSumary1._1OS1orderItemSumary2, 'Id', '1OS1orderItemSumary2');
        });

        it('An "orderSummaryToOrderItemSummaries" object should contain the "_1OS1orderItemSumary3" with a nested property Id that is equal to "1OS1orderItemSumary3"', function () {
            var mappingObjects = somHelpers.createOrderSummaryMapObjects(somOrderSummaries);
            // eslint-disable-next-line no-underscore-dangle
            assert.propertyVal(mappingObjects.orderSummaryToOrderItemSummaries._1OrderSumary1._1OS1orderItemSumary3, 'Id', '1OS1orderItemSumary3');
        });

        it('orderSummaryToOrderItemSummaries object with  _1OrderSumary2 nested property that contains "_1OS2orderItemSumary1" key ', function () {
            var mappingObjects = somHelpers.createOrderSummaryMapObjects(somOrderSummaries);
            // eslint-disable-next-line no-underscore-dangle
            assert.hasAllKeys(mappingObjects.orderSummaryToOrderItemSummaries._1OrderSumary2, ['_1OS2orderItemSumary1']);
        });

        it('An "orderSummaryToOrderItemSummaries" object should contain the "_1OS2orderItemSumary1" with a nested property Id that is equal to "1OS1orderItemSumary3"', function () {
            var mappingObjects = somHelpers.createOrderSummaryMapObjects(somOrderSummaries);
            // eslint-disable-next-line no-underscore-dangle
            assert.propertyVal(mappingObjects.orderSummaryToOrderItemSummaries._1OrderSumary2._1OS2orderItemSumary1, 'Id', '1OS2orderItemSumary1');
        });
    });

    describe('Verify the mapping between OrderSummary and OrderDeliveryGroupSummary', function () {
        it('An "orderSummaryToOrderDeliveryGroupSummaries" object should contain the "_1OrderSumary1", "_1OrderSumary2" keys', function () {
            var mappingObjects = somHelpers.createOrderSummaryMapObjects(somOrderSummaries);
            assert.containsAllKeys(mappingObjects.orderSummaryToOrderDeliveryGroupSummaries, ['_1OrderSumary1', '_1OrderSumary2']);
        });

        it('Should return an object with the "orderSummaryToOrderDeliveryGroupSummaries" property that contains the "_1OS1orderDeliveryGroupSumary1", "_1OS1orderDeliveryGroupSumary2" property', function () {
            var mappingObjects = somHelpers.createOrderSummaryMapObjects(somOrderSummaries);
            // eslint-disable-next-line no-underscore-dangle
            assert.containsAllKeys(mappingObjects.orderSummaryToOrderDeliveryGroupSummaries._1OrderSumary1, ['_1OS1orderDeliveryGroupSumary1', '_1OS1orderDeliveryGroupSumary2']);
        });

        it('An "orderSummaryToOrderItemSummaries" object should contain the "_1OS1orderDeliveryGroupSumary1" with a nested property Id that is equal to "1OS1orderDeliveryGroupSumary1"', function () {
            var mappingObjects = somHelpers.createOrderSummaryMapObjects(somOrderSummaries);
            // eslint-disable-next-line no-underscore-dangle
            assert.propertyVal(mappingObjects.orderSummaryToOrderDeliveryGroupSummaries._1OrderSumary1._1OS1orderDeliveryGroupSumary1, 'Id', '1OS1orderDeliveryGroupSumary1');
        });

        it('An "orderSummaryToOrderItemSummaries" object should contain the "_1OS1orderDeliveryGroupSumary2" with a nested property Id that is equal to "1OS1orderDeliveryGroupSumary2"', function () {
            var mappingObjects = somHelpers.createOrderSummaryMapObjects(somOrderSummaries);
            // eslint-disable-next-line no-underscore-dangle
            assert.propertyVal(mappingObjects.orderSummaryToOrderDeliveryGroupSummaries._1OrderSumary1._1OS1orderDeliveryGroupSumary2, 'Id', '1OS1orderDeliveryGroupSumary2');
        });

        it('Should return an object with the "orderSummaryToOrderDeliveryGroupSummaries" property that contains the "_1OS1orderDeliveryGroupSumary1" property', function () {
            var mappingObjects = somHelpers.createOrderSummaryMapObjects(somOrderSummaries);
            // eslint-disable-next-line no-underscore-dangle
            assert.containsAllKeys(mappingObjects.orderSummaryToOrderDeliveryGroupSummaries._1OrderSumary2, ['_1OS2orderDeliveryGroupSumary1']);
        });

        it('An "orderSummaryToOrderItemSummaries" object should contain the "_1OS1orderDeliveryGroupSumary1" with a nested property Id that is equal to "1OS2orderDeliveryGroupSumary1"', function () {
            var mappingObjects = somHelpers.createOrderSummaryMapObjects(somOrderSummaries);
            // eslint-disable-next-line no-underscore-dangle
            assert.propertyVal(mappingObjects.orderSummaryToOrderDeliveryGroupSummaries._1OrderSumary2._1OS2orderDeliveryGroupSumary1, 'Id', '1OS2orderDeliveryGroupSumary1');
        });
    });

    describe('Verify the mapping between OrderSummary and orderPaymentSummary', function () {
        it('An "orderSummaryToOrderPaymentSummaries" object should contain the "_1OrderSumary1", "_1OrderSumary2" keys', function () {
            var mappingObjects = somHelpers.createOrderSummaryMapObjects(somOrderSummaries, somOrderPayment);
            assert.containsAllKeys(mappingObjects.orderSummaryToOrderPaymentSummaries, ['_1OrderSumary1', '_1OrderSumary2']);
        });

        it('An "orderSummaryToOrderPaymentSummaries" object should contain the "_1OrderSumary1" with a nested property Id that is equal to "_1OS1orderPaymentSumary1"', function () {
            var mappingObjects = somHelpers.createOrderSummaryMapObjects(somOrderSummaries, somOrderPayment);
            // eslint-disable-next-line no-underscore-dangle
            assert.equal(mappingObjects.orderSummaryToOrderPaymentSummaries._1OrderSumary1._1OS1orderPaymentSumary1.Id, '1OS1orderPaymentSumary1');
        });

        it('An "orderSummaryToOrderPaymentSummaries" object should contain the "_1OrderSumary2" with a nested property Id that is equal to "_1OS1orderPaymentSumary1"', function () {
            var mappingObjects = somHelpers.createOrderSummaryMapObjects(somOrderSummaries, somOrderPayment);
            // eslint-disable-next-line no-underscore-dangle
            assert.equal(mappingObjects.orderSummaryToOrderPaymentSummaries._1OrderSumary2._1OS1orderPaymentSumary1.Id, '1OS1orderPaymentSumary1');
        });
    });
});
