'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var orderSummaryToOrderItemSummariesMapMock = {
    _1OrderSumary1: {
        _1OS1orderItemSumary1: {
            Id: '1OS1orderItemSumary1',
            ProductCode: 'productCode1'
        },
        _1OS1orderItemSumary2: {
            Id: '1OS1orderItemSumary2',
            ProductCode: 'productCode2'
        },
        _1OS1orderItemSumary3: {
            Id: '1OS1orderItemSumary3',
            ProductCode: 'productCode3'
        }
    },
    _1OrderSumary2: {
        _1OS2orderItemSumary1: {
            Id: '1OS2orderItemSumary1',
            ProductCode: 'productCode11'
        }
    }
};

var orderSummaryToFulfillmentOrdersMapMock = {
    '_1OrderSumary1': {
        '_0FulfillmentOrder1a': {
            'attributes': {
                'type': 'FulfillmentOrder'
            },
            'OrderSummaryId': '1OrderSumary1',
            'Id': '0FulfillmentOrder1a',
            'FulfillmentOrderLineItems': {
                'records': [
                    {
                        'attributes': {
                            'type': 'FulfillmentOrderLineItem'
                        },
                        'Id': '0FulfillmentOrderLineItem1a',
                        'OrderItemSummaryId': '10uR000000000zmIAA'
                    },
                    {
                        'attributes': {
                            'type': 'FulfillmentOrderLineItem'
                        },
                        'Id': '0FulfillmentOrderLineItem1b',
                        'OrderItemSummaryId': '10uR000000000znIAA'
                    }
                ]
            },
            'FulfillmentOrderShipments': {
                'records': [
                    {
                        'attributes': {
                            'type': 'Shipment'
                        },
                        'FulfillmentOrderId': '0FulfillmentOrder1a',
                        'Id': '0FulfillmentOrderShipments1a'
                    },
                    {
                        'attributes': {
                            'type': 'Shipment'
                        },
                        'FulfillmentOrderId': '0FulfillmentOrder1a',
                        'Id': '0FulfillmentOrderShipments1b'
                    }
                ]
            }
        },
        '_0FulfillmentOrder1b': {
            'attributes': {
                'type': 'FulfillmentOrder'
            },
            'OrderSummaryId': '1OrderSumary1',
            'Id': '0FulfillmentOrder1b',
            'FulfillmentOrderLineItems': {
                'records': [
                    {
                        'attributes': {
                            'type': 'FulfillmentOrderLineItem'
                        },
                        'Id': '0FulfillmentOrderLineItem1c',
                        'OrderItemSummaryId': '10uR000000000zoIAA'
                    }
                ]
            }
        }
    }
};

var somApiOrderSummaryMock = {
    Id: '1OrderSumary1',
    OrderNumber: 'ecom-order-1',
    OrderedDate: '2022-11-25T20:42:34.000+0000',
    OrderItemSummaries: {
        records: [
            {
                Id: '100001',
                ProductCode: 'productCode1',
                Quantity: 1,
                TotalPrice: 15.00
            },
            {
                Id: '100002',
                ProductCode: 'productCode2',
                Quantity: 2,
                TotalPrice: 20.00
            }
        ]
    },
    OrderPaymentSummaries: {
        records: [
            {
                Id: '100001',
                ProductCode: 'productCode1',
                Quantity: 1,
                TotalPrice: 15.00
            },
            {
                Id: '100002',
                ProductCode: 'productCode2',
                Quantity: 2,
                TotalPrice: 20.00
            }
        ]
    }
};

var somApiOrderSummaryNoFulfillmentOrderMock = {
    Id: 'noFulfillmentOrderSummaryId',
    OrderNumber: 'ecom-order-1',
    OrderedDate: '2022-11-25T20:42:34.000+0000',
    OrderItemSummaries: {
        records: [
            {
                Id: '100001',
                ProductCode: 'productCode1',
                Quantity: 1,
                TotalPrice: 15.00
            },
            {
                Id: '100002',
                ProductCode: 'productCode2',
                Quantity: 2,
                TotalPrice: 20.00
            }
        ]
    },
    OrderPaymentSummaries: {
        records: [
            {
                Id: '100001',
                ProductCode: 'productCode1',
                Quantity: 1,
                TotalPrice: 15.00
            },
            {
                Id: '100002',
                ProductCode: 'productCode2',
                Quantity: 2,
                TotalPrice: 20.00
            }
        ]
    }
};

var somPreferencesMock = {
    statusOrdered: 'Ordered',
    statusInProgress: 'InProgress',
    statusShipped: 'Shipped',
    statusReturned: 'Returned',
    statusCanceled: 'Canceled',
    statusFulfilled: 'Fulfilled'
};

var fulfillOrderLineItemsMock = [{
    'orderItemSummaryId': '1OrderSumary1',
    'currencyCode': 'USD',
    'sfccProductId': 'ecom-order-1',
    'fulfillmentOrderLineItemId': 'fulfillment-Order-Line-ItemId1',
    'quantity': 1,
    'quantityAvailableToCancel': 0,
    'quantityAvailableToFulfill': 0,
    'quantityAvailableToReturn': 0,
    'quantityOrdered': 1,
    'quantityCanceled': 0,
    'quantityReturned': 0,
    'totalPrice': 15,
    'price': 15
},
{
    'orderItemSummaryId': '1OrderSumary2',
    'currencyCode': 'USD',
    'sfccProductId': 'ecom-order-2',
    'fulfillmentOrderLineItemId': 'fulfillment-Order-Line-ItemId2',
    'quantity': 2,
    'quantityAvailableToCancel': 0,
    'quantityAvailableToFulfill': 0,
    'quantityAvailableToReturn': 0,
    'quantityOrdered': 2,
    'quantityCanceled': 0,
    'quantityReturned': 0,
    'totalPrice': 20,
    'price': 20
}
];

// eslint-disable-next-line no-shadow
function createSomOrderModel(somPreferences, fulfillOrderLineItemsMock, disableNoneFulfillOrderLineItems) {
    return proxyquire('../../../../cartridges/plugin_ordermanagement/cartridge/models/somOrder', {
        '*/cartridge/models/somTotals': function () {
            return {};
        },
        '*/cartridge/models/somOrder': function () {
            return {};
        },
        '*/cartridge/models/somPayment': function () {
            return {};
        },
        '*/cartridge/models/somBilling': function () {
            return {};
        },
        '*/cartridge/models/somShipping': function () {
            return {};
        },
        '*/cartridge/models/somFulfillmentOrder': function (fulfillmentDetails) {
            this.id = fulfillmentDetails.id;
            this.orderSummaryId = fulfillmentDetails.orderSummaryId;
            this.status = fulfillmentDetails.fulfillmentStatus;
            this.orderItems = ['abc'];
        },
        'dw/order/OrderMgr': {
            getOrder: function () {
                return {
                    currencyCode: 'USD'
                };
            }
        },
        '*/cartridge/scripts/helpers/utilHelpers': {
            convertDateStringToDateObject: function (dateString) {
                return new Date(dateString);
            }
        },
        '*/cartridge/scripts/helpers/somHelpers': {
            getNoneFulfillOrderLineItems: function (config) {
                if (disableNoneFulfillOrderLineItems) {
                    return [];
                }
                return config.orderItemSummaries;
            },
            getFulfillOrderLineItems: function () {
                return fulfillOrderLineItemsMock;
            },
            getFulfillmentStatus: function (apiFulfillmentOrder) {
                var fulfillmentStatus;
                if (apiFulfillmentOrder.FulfillmentOrderShipments && apiFulfillmentOrder.FulfillmentOrderShipments.records.length > 0) {
                    // If the fulfillment has shipment(s), then fulfillment has a "Shipped" status.
                    fulfillmentStatus = 'Shipped';
                } else {
                    fulfillmentStatus = 'InProgress';
                }
                return fulfillmentStatus;
            }
        },
        '*/cartridge/config/somPreferences': somPreferencesMock
    });
}

describe('Should create somOrder model with NO fulfillment for the order', function () {
    var SomOrder = createSomOrderModel(somPreferencesMock, []);

    it('should create the somOrder model with the "id" property that is equal to "noFulfillmentOrderSummaryId"', function () {
        var somOrderModel = new SomOrder(somApiOrderSummaryNoFulfillmentOrderMock, orderSummaryToOrderItemSummariesMapMock, orderSummaryToFulfillmentOrdersMapMock);
        assert.equal(somOrderModel.id, 'noFulfillmentOrderSummaryId');
    });

    it('should create the somOrder model with the "sfccOrderNumber" property that is equal to "ecom-order-1"', function () {
        var somOrderModel = new SomOrder(somApiOrderSummaryMock, orderSummaryToOrderItemSummariesMapMock, orderSummaryToFulfillmentOrdersMapMock);
        assert.equal(somOrderModel.sfccOrderNumber, 'ecom-order-1');
    });

    it('should create the somOrder model with the "orderedDate" property that is not equal to "null"', function () {
        var somOrderModel = new SomOrder(somApiOrderSummaryMock, orderSummaryToOrderItemSummariesMapMock, orderSummaryToFulfillmentOrdersMapMock);
        assert.isNotNull(somOrderModel.orderedDate);
    });

    it('should create the somOrder model with the "currencyCode" property that is equal to "USD"', function () {
        var somOrderModel = new SomOrder(somApiOrderSummaryMock, orderSummaryToOrderItemSummariesMapMock, orderSummaryToFulfillmentOrdersMapMock);
        assert.equal(somOrderModel.currencyCode, 'USD');
    });

    it('should create the somOrder model with the "totals" property that is not equal to "null"', function () {
        var somOrderModel = new SomOrder(somApiOrderSummaryMock, orderSummaryToOrderItemSummariesMapMock, orderSummaryToFulfillmentOrdersMapMock);
        assert.isNotNull(somOrderModel.totals);
    });

    it('should create the somOrder model with the "orderedStatusGroupItems" property with length of "1"', function () {
        var somOrderModel = new SomOrder(somApiOrderSummaryMock, orderSummaryToOrderItemSummariesMapMock, orderSummaryToFulfillmentOrdersMapMock);
        assert.equal(somOrderModel.orderedStatusGroupItems.length, 1);
    });

    it('should create the somOrder model with the "inProgressStatusGroupItems" property that is equal to "0"', function () {
        var somOrderModel = new SomOrder(somApiOrderSummaryMock, orderSummaryToOrderItemSummariesMapMock, orderSummaryToFulfillmentOrdersMapMock);
        assert.equal(somOrderModel.inProgressStatusGroupItems.length, 0);
    });

    it('should create the somOrder model with the "shippedStatusGroupItems" property that is equal to "0"', function () {
        var somOrderModel = new SomOrder(somApiOrderSummaryMock, orderSummaryToOrderItemSummariesMapMock, orderSummaryToFulfillmentOrdersMapMock);
        assert.equal(somOrderModel.shippedStatusGroupItems.length, 0);
    });
});

describe('should create somOrder object for order with fulfillment of Ordered, InProgress and Shipped status', function () {
    var SomOrder = createSomOrderModel(somPreferencesMock, fulfillOrderLineItemsMock);

    it('should create the somOrder model with the "id" property that is equal to "1OrderSumary1"', function () {
        var somOrderModel = new SomOrder(somApiOrderSummaryMock, orderSummaryToOrderItemSummariesMapMock, orderSummaryToFulfillmentOrdersMapMock);
        assert.equal(somOrderModel.id, '1OrderSumary1');
    });

    it('should create the somOrder model with the "sfccOrderNumber" property that is equal to "ecom-order-1"', function () {
        var somOrderModel = new SomOrder(somApiOrderSummaryMock, orderSummaryToOrderItemSummariesMapMock, orderSummaryToFulfillmentOrdersMapMock);
        assert.equal(somOrderModel.sfccOrderNumber, 'ecom-order-1');
    });

    it('should create the somOrder model with the "orderedDate" property that is not equal to "null"', function () {
        var somOrderModel = new SomOrder(somApiOrderSummaryMock, orderSummaryToOrderItemSummariesMapMock, orderSummaryToFulfillmentOrdersMapMock);
        assert.isNotNull(somOrderModel.orderedDate);
    });

    it('should create the somOrder model with the "currencyCode" property that is equal to "USD"', function () {
        var somOrderModel = new SomOrder(somApiOrderSummaryMock, orderSummaryToOrderItemSummariesMapMock, orderSummaryToFulfillmentOrdersMapMock);
        assert.equal(somOrderModel.currencyCode, 'USD');
    });

    it('should create the somOrder model with the "totals" property that is not equal to "null"', function () {
        var somOrderModel = new SomOrder(somApiOrderSummaryMock, orderSummaryToOrderItemSummariesMapMock, orderSummaryToFulfillmentOrdersMapMock);
        assert.isNotNull(somOrderModel.totals);
    });

    it('should create the somOrder model with the "orderedStatusGroupItems" property with length of "1"', function () {
        var somOrderModel = new SomOrder(somApiOrderSummaryMock, orderSummaryToOrderItemSummariesMapMock, orderSummaryToFulfillmentOrdersMapMock);
        assert.equal(somOrderModel.orderedStatusGroupItems.length, 1);
    });

    it('should create the somOrder model with the "inProgressStatusGroupItems" property that is equal to "0"', function () {
        var somOrderModel = new SomOrder(somApiOrderSummaryMock, orderSummaryToOrderItemSummariesMapMock, orderSummaryToFulfillmentOrdersMapMock);
        assert.equal(somOrderModel.inProgressStatusGroupItems.length, 1);
    });

    it('should create the somOrder model with the "shippedStatusGroupItems" property that is equal to "0"', function () {
        var somOrderModel = new SomOrder(somApiOrderSummaryMock, orderSummaryToOrderItemSummariesMapMock, orderSummaryToFulfillmentOrdersMapMock);
        assert.equal(somOrderModel.shippedStatusGroupItems.length, 1);
    });
});

describe('should create somOrder object for order with fulfillment and no more items in OrderItemSummaries (no more items to fulfilled)', function () {
    var SomOrder = createSomOrderModel(somPreferencesMock, fulfillOrderLineItemsMock, true);
    it('should create the somOrder model with the "id" property that is equal to "1OrderSumary1"', function () {
        var somOrderModel = new SomOrder(somApiOrderSummaryMock, orderSummaryToOrderItemSummariesMapMock, orderSummaryToFulfillmentOrdersMapMock);
        assert.equal(somOrderModel.id, '1OrderSumary1');
    });

    it('should create the somOrder model with the "sfccOrderNumber" property that is equal to "ecom-order-1"', function () {
        var somOrderModel = new SomOrder(somApiOrderSummaryMock, orderSummaryToOrderItemSummariesMapMock, orderSummaryToFulfillmentOrdersMapMock);
        assert.equal(somOrderModel.sfccOrderNumber, 'ecom-order-1');
    });

    it('should create the somOrder model with the "orderedDate" property that is not equal to "null"', function () {
        var somOrderModel = new SomOrder(somApiOrderSummaryMock, orderSummaryToOrderItemSummariesMapMock, orderSummaryToFulfillmentOrdersMapMock);
        assert.isNotNull(somOrderModel.orderedDate);
    });

    it('should create the somOrder model with the "currencyCode" property that is equal to "USD"', function () {
        var somOrderModel = new SomOrder(somApiOrderSummaryMock, orderSummaryToOrderItemSummariesMapMock, orderSummaryToFulfillmentOrdersMapMock);
        assert.equal(somOrderModel.currencyCode, 'USD');
    });

    it('should create the somOrder model with the "totals" property that is not equal to "null"', function () {
        var somOrderModel = new SomOrder(somApiOrderSummaryMock, orderSummaryToOrderItemSummariesMapMock, orderSummaryToFulfillmentOrdersMapMock);
        assert.isNotNull(somOrderModel.totals);
    });

    it('should create the somOrder model with the "orderedStatusGroupItems" property with length of "0"', function () {
        var somOrderModel = new SomOrder(somApiOrderSummaryMock, orderSummaryToOrderItemSummariesMapMock, orderSummaryToFulfillmentOrdersMapMock);
        assert.equal(somOrderModel.orderedStatusGroupItems.length, 0);
    });

    it('should create the somOrder model with the "inProgressStatusGroupItems" property that is equal to "1"', function () {
        var somOrderModel = new SomOrder(somApiOrderSummaryMock, orderSummaryToOrderItemSummariesMapMock, orderSummaryToFulfillmentOrdersMapMock);
        assert.equal(somOrderModel.inProgressStatusGroupItems.length, 1);
    });

    it('should create the somOrder model with the "shippedStatusGroupItems" property that is equal to "1"', function () {
        var somOrderModel = new SomOrder(somApiOrderSummaryMock, orderSummaryToOrderItemSummariesMapMock, orderSummaryToFulfillmentOrdersMapMock);
        assert.equal(somOrderModel.shippedStatusGroupItems.length, 1);
    });
});

describe('should create somOrder object with default values when SOM API Order Summary object is null', function () {
    var SomOrder = createSomOrderModel(somPreferencesMock, [], true);

    it('should create the somOrder model with the "id" property that is equal to "null"', function () {
        var somOrderModel = new SomOrder(null);
        assert.isNull(somOrderModel.id);
    });

    it('should create the somOrder model with the "sfccOrderNumber" property that is equal to "null"', function () {
        var somOrderModel = new SomOrder(null);
        assert.isNull(somOrderModel.sfccOrderNumber);
    });

    it('should create the somOrder model with the "orderedDate" property that is equal to "null"', function () {
        var somOrderModel = new SomOrder(null);
        assert.isNull(somOrderModel.orderedDate);
    });

    it('should create the somOrder model with the "currencyCode" property that is equal to "null"', function () {
        var somOrderModel = new SomOrder(null);
        assert.isNull(somOrderModel.currencyCode);
    });

    it('should create the somOrder model with the "totals" property that is not equal to "null"', function () {
        var somOrderModel = new SomOrder(null);
        assert.isNull(somOrderModel.totals);
    });

    it('should create the somOrder model with the "orderedStatusGroupItems" property with length of "0"', function () {
        var somOrderModel = new SomOrder(null);
        assert.equal(somOrderModel.orderedStatusGroupItems.length, 0);
    });

    it('should create the somOrder model with the "inProgressStatusGroupItems" property that is equal to "0"', function () {
        var somOrderModel = new SomOrder(null);
        assert.equal(somOrderModel.inProgressStatusGroupItems.length, 0);
    });

    it('should create the somOrder model with the "shippedStatusGroupItems" property that is equal to "0"', function () {
        var somOrderModel = new SomOrder(null);
        assert.equal(somOrderModel.shippedStatusGroupItems.length, 0);
    });
});
