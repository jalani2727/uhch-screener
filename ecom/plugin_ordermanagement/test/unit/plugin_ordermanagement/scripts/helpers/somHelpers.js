'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();


describe('SOM Helpers', function () {
    var somHelpers = proxyquire('../../../../../cartridges/plugin_ordermanagement/cartridge/scripts/helpers/somHelpers', {
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

    describe('createFulfillmentOrderMapObjects', function () {
        it('should return objects for looking up SOM FulfillmentOrder information - existingOrderSummaryToFulfillmentOrders NOT null', function () {
            var somFulfillmentOrder1 = {
                body: {
                    records: [{
                        attributes: { type: 'FulfillmentOrder' },
                        OrderSummaryId: '1OrderSumary1',
                        Id: '0FulfillmentOrder1a',
                        FulfillmentOrderLineItems: {
                            records: [{
                                attributes: { type: 'FulfillmentOrderLineItem' },
                                Id: '0FulfillmentOrderLineItem1a',
                                OrderItemSummaryId: '10uR000000000zmIAA'
                            }, {
                                attributes: { type: 'FulfillmentOrderLineItem' },
                                Id: '0FulfillmentOrderLineItem1b',
                                OrderItemSummaryId: '10uR000000000znIAA'
                            }]
                        },
                        FulfillmentOrderShipments: {
                            records: [{
                                attributes: { type: 'Shipment' },
                                FulfillmentOrderId: '0FulfillmentOrder1a',
                                Id: '0FulfillmentOrderShipments1a'
                            }, {
                                attributes: { type: 'Shipment' },
                                FulfillmentOrderId: '0FulfillmentOrder1a',
                                Id: '0FulfillmentOrderShipments1b'
                            }]
                        }
                    }, {
                        attributes: { type: 'FulfillmentOrder' },
                        OrderSummaryId: '1OrderSumary1',
                        Id: '0FulfillmentOrder1b',
                        FulfillmentOrderLineItems: {
                            records: [{
                                attributes: { type: 'FulfillmentOrderLineItem' },
                                Id: '0FulfillmentOrderLineItem1c',
                                OrderItemSummaryId: '10uR000000000zoIAA'
                            }]
                        },
                        FulfillmentOrderShipments: {
                            records: [{
                                attributes: { type: 'Shipment' },
                                FulfillmentOrderId: '0FulfillmentOrder1b',
                                Id: '0OBR000000000msOAA'
                            }]
                        }
                    }]
                }
            };

            var somFulfillmentOrder2 = {
                body: {
                    records: [{
                        attributes: { type: 'FulfillmentOrder' },
                        OrderSummaryId: '1OrderSumary2',
                        Id: '0FulfillmentOrder2a',
                        FulfillmentOrderLineItems: {
                            records: [{
                                attributes: { type: 'FulfillmentOrderLineItem' },
                                Id: '0FulfillmentOrderLineItem2a',
                                OrderItemSummaryId: '10uR000000000hjIAA'
                            }, {
                                attributes: { type: 'FulfillmentOrderLineItem' },
                                Id: '0FulfillmentOrderLineItem2b',
                                OrderItemSummaryId: '10uR000000000hkIAA'
                            }]
                        },
                        FulfillmentOrderShipments: {
                            records: [{
                                attributes: { type: 'Shipment' },
                                FulfillmentOrderId: '0FulfillmentOrder2a',
                                Id: '0OBR000000000j6OAA'
                            }]
                        }
                    }]
                }
            };

            var mappingObjects1 = somHelpers.createFulfillmentOrderMapObjects(somFulfillmentOrder1, {});
            assert.equal(Object.keys(mappingObjects1).length, 1);

            // Verify the mapping between OrderSummary and FulfillmentOrder for '1OrderSumary1'
            var orderSummaryToFulfillmentOrders = mappingObjects1.orderSummaryToFulfillmentOrders;
            assert.equal(Object.keys(orderSummaryToFulfillmentOrders).length, 1);
            assert.equal(Object.keys(orderSummaryToFulfillmentOrders['_1OrderSumary1']).length, 2);   // eslint-disable-line
            assert.equal(orderSummaryToFulfillmentOrders['_1OrderSumary1']['_0FulfillmentOrder1a'].OrderSummaryId, '1OrderSumary1');   // eslint-disable-line
            assert.equal(orderSummaryToFulfillmentOrders['_1OrderSumary1']['_0FulfillmentOrder1a'].Id, '0FulfillmentOrder1a');   // eslint-disable-line
            assert.equal(orderSummaryToFulfillmentOrders['_1OrderSumary1']['_0FulfillmentOrder1b'].OrderSummaryId, '1OrderSumary1');   // eslint-disable-line
            assert.equal(orderSummaryToFulfillmentOrders['_1OrderSumary1']['_0FulfillmentOrder1b'].Id, '0FulfillmentOrder1b');   // eslint-disable-line

            // -- append the second FulfillmentOrder to the first mapping
            var mappingObjects2 = somHelpers.createFulfillmentOrderMapObjects(somFulfillmentOrder2, mappingObjects1.orderSummaryToFulfillmentOrders);
            assert.equal(Object.keys(mappingObjects2).length, 1);

            // Verify the mapping between OrderSummary and FulfillmentOrder for somFulfillmentOrder1 and somFulfillmentOrder2
            var orderSummaryToFulfillmentOrders2 = mappingObjects2.orderSummaryToFulfillmentOrders;
            assert.equal(Object.keys(orderSummaryToFulfillmentOrders2).length, 2);
            assert.equal(Object.keys(orderSummaryToFulfillmentOrders2['_1OrderSumary1']).length, 2);   // eslint-disable-line
            assert.equal(orderSummaryToFulfillmentOrders2['_1OrderSumary1']['_0FulfillmentOrder1a'].OrderSummaryId, '1OrderSumary1');   // eslint-disable-line
            assert.equal(orderSummaryToFulfillmentOrders2['_1OrderSumary1']['_0FulfillmentOrder1a'].Id, '0FulfillmentOrder1a');   // eslint-disable-line
            assert.equal(orderSummaryToFulfillmentOrders2['_1OrderSumary1']['_0FulfillmentOrder1b'].OrderSummaryId, '1OrderSumary1');   // eslint-disable-line
            assert.equal(orderSummaryToFulfillmentOrders2['_1OrderSumary1']['_0FulfillmentOrder1b'].Id, '0FulfillmentOrder1b');   // eslint-disable-line
            assert.equal(Object.keys(orderSummaryToFulfillmentOrders2['_1OrderSumary2']).length, 1);   // eslint-disable-line
            assert.equal(orderSummaryToFulfillmentOrders2['_1OrderSumary2']['_0FulfillmentOrder2a'].OrderSummaryId, '1OrderSumary2');   // eslint-disable-line
            assert.equal(orderSummaryToFulfillmentOrders2['_1OrderSumary2']['_0FulfillmentOrder2a'].Id, '0FulfillmentOrder2a');   // eslint-disable-line
        });

        it('should return objects for looking up SOM FulfillmentOrder information - existingOrderSummaryToFulfillmentOrders is null', function () {
            var somFulfillmentOrder = {
                body: {
                    records: [{
                        attributes: { type: 'FulfillmentOrder' },
                        OrderSummaryId: '1OrderSumary10',
                        Id: '0FulfillmentOrderA',
                        FulfillmentOrderLineItems: {
                            records: [{
                                attributes: { type: 'FulfillmentOrderLineItem' },
                                Id: '0FulfillmentOrderLineItemA1',
                                OrderItemSummaryId: '10uR000000000hjIAA'
                            }]
                        }
                    }]
                }
            };

            var mappingObjects = somHelpers.createFulfillmentOrderMapObjects(somFulfillmentOrder);
            assert.equal(Object.keys(mappingObjects).length, 1);

            // Verify the mapping between OrderSummary and FulfillmentOrder for somFulfillmentOrder
            var orderSummaryToFulfillmentOrders = mappingObjects.orderSummaryToFulfillmentOrders;
            assert.equal(Object.keys(orderSummaryToFulfillmentOrders).length, 1);
            assert.equal(Object.keys(orderSummaryToFulfillmentOrders['_1OrderSumary10']).length, 1);   // eslint-disable-line
            assert.equal(orderSummaryToFulfillmentOrders['_1OrderSumary10']['_0FulfillmentOrderA'].OrderSummaryId, '1OrderSumary10');   // eslint-disable-line
        });
    });

    describe('createOrderDeliveryMethodMapObjects', function () {
        it('should return a object that map order delivery method ID to order delivery method name', function () {
            var somDeliverMethods = {
                'body': {
                    'records': [{
                        'attributes': { 'type': 'OrderDeliveryMethod' },
                        'Id': '2Delivermethod1',
                        'Name': 'Ground',
                        'ProductId': '01tR0000000L7QTIA0'
                    }, {
                        'attributes': { 'type': 'OrderDeliveryMethod' },
                        'Id': '2Delivermethod2',
                        'Name': 'Next Day',
                        'ProductId': '01tR0000000LG4yIAG'
                    }, {
                        'attributes': { 'type': 'OrderDeliveryMethod' },
                        'Id': '2Delivermethod3',
                        'Name': '2 Day',
                        'ProductId': '01tR0000000L7QTIA0'
                    }]
                }
            };

            var deliverMetodIds = somHelpers.createOrderDeliveryMethodMapObjects(somDeliverMethods);
            assert.equal(Object.keys(deliverMetodIds).length, 3);
            assert.equal(deliverMetodIds['2Delivermethod1'].Name, 'Ground');
            assert.equal(deliverMetodIds['2Delivermethod2'].Name, 'Next Day');
            assert.equal(deliverMetodIds['2Delivermethod3'].Name, '2 Day');
        });
    });

    describe('getFulfillmentStatus', function () {
        it('should return InProgress status', function () {
            var fulfillmentOrder = {
            };
            var status = somHelpers.getFulfillmentStatus(fulfillmentOrder);
            assert.equal(status, 'InProgress');
        });

        it('should return Shipped status', function () {
            var fulfillmentOrder = {
                FulfillmentOrderShipments: {
                    records: [{}, {}]
                }
            };
            var status = somHelpers.getFulfillmentStatus(fulfillmentOrder);
            assert.equal(status, 'Shipped');
        });
    });

    describe('getFulfillOrderLineItems', function () {
        it('should return a list of fulfillment orders that has not been fulfilled when hasFulfillment is true', function () {
            var orderSummaryToOrderItemSummariesMapMock = {
                _1OrderSumary1: {
                    _1OS1orderItemSumary1: {
                        Id: '1OS1orderItemSumary1',
                        Quantity: 1,
                        ProductCode: 'productCode1'
                    },
                    _1OS1orderItemSumary2: {
                        Id: '1OS1orderItemSumary2',
                        Quantity: 3,
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

            var fulfillmentOrderLineItems = [
                {
                    Id: 'fulfill-100001',
                    OrderItemSummaryId: '1OS1orderItemSumary1',
                    Quantity: 1,
                    TotalPrice: 15.00
                },
                {
                    Id: 'fulfill-100002',
                    OrderItemSummaryId: '1OS1orderItemSumary2',
                    Quantity: 3,
                    TotalPrice: 60.00
                }
            ];

            var config = {
                somOrderSummaryId: '1OrderSumary1',
                somFulfillmentOrderLineItems: fulfillmentOrderLineItems,
                currencyCode: 'USD',
                somOrderToOrderItemSummariesMap: orderSummaryToOrderItemSummariesMapMock
            };

            var items = somHelpers.getFulfillOrderLineItems(config);
            assert.equal(items.length, 2);
            assert.equal(items[0].orderItemSummaryId, '1OS1orderItemSumary1');
            assert.equal(items[0].currencyCode, 'USD');
            assert.equal(items[0].sfccProductId, 'productCode1');
            assert.equal(items[0].fulfillmentOrderLineItemId, 'fulfill-100001');
            assert.equal(items[0].quantity, 1);
            assert.equal(items[0].totalPrice, 15);
            assert.equal(items[1].orderItemSummaryId, '1OS1orderItemSumary2');
            assert.equal(items[1].currencyCode, 'USD');
            assert.equal(items[1].sfccProductId, 'productCode2');
            assert.equal(items[1].fulfillmentOrderLineItemId, 'fulfill-100002');
            assert.equal(items[1].quantity, 3);
            assert.equal(items[1].totalPrice, 60);
        });
    });

    describe('expandJSON', function () {
        it('should return a JSON object from valid JSON string', function () {
            var jsonString = '{ "totalQuantity": 3, "toalPrice": 29.99 }';
            var result = somHelpers.expandJSON(jsonString);
            assert.equal(result.totalQuantity, 3);
            assert.equal(result.toalPrice, 29.99);
        });

        it('should return a default object if JSON string is null', function () {
            var jsonString = null;
            var defaultObj = { default: 'default' };
            var result = somHelpers.expandJSON(jsonString, defaultObj);
            assert.equal(result.default, 'default');
        });

        it('should return a default object if JSON string is null', function () {
            var jsonString = '{ "totalQuantity": 3, toalPrice: 29.99 }';
            var defaultObj = { default: 'default' };
            var result = somHelpers.expandJSON(jsonString, defaultObj);
            assert.equal(result.default, 'default');
        });
    });
});
