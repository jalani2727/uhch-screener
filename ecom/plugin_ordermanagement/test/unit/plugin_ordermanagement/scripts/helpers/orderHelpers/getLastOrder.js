'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');
var logSpy;

describe('orderHelpers.orderHelpers', function () {
    beforeEach(function () {
        logSpy = sinon.spy();
    });
    describe('should get the last order as the somOrder Model', function () {
        var orderHelpers = proxyquire('../../../../../../cartridges/plugin_ordermanagement/cartridge/scripts/order/orderHelpers', {

            'dw/web/Resource': {},
            'dw/web/URLUtils': {},
            'dw/catalog/ProductMgr': {},
            '*/cartridge/scripts/helpers/productHelpers': {},
            '*/cartridge/scripts/helpers/utilHelpers': {},
            '*/cartridge/models/product/decorators/index': {},
            '*/cartridge/scripts/som': {
                getLastOrder: function () {
                    return {
                        ok: true,
                        object: {
                            responseObj: {
                                compositeResponse: [
                                    {
                                        body: {
                                            records: [
                                                {
                                                    Id: 'somOrderId00001',
                                                    OrderNumber: '00001501@RefArch',
                                                    OrderedDate: '11-25-2022',
                                                    OrderItemSummaries: {
                                                        'totalSize': 2,
                                                        'done': true,
                                                        'records': [{
                                                            'attributes': {
                                                                'type': 'OrderItemSummary',
                                                                'url': '/services/data/v51.0/sobjects/OrderItemSummary/10uB0000000V7AkIAK'
                                                            },
                                                            'Id': '10uB0000000V7AkIAK',
                                                            'ProductCode': '701644348151M',
                                                            'OrderDeliveryGroupSummaryId': '0agB0000000V3yaIAC',
                                                            'Quantity': 1,
                                                            'QuantityAvailableToFulfill': 0,
                                                            'QuantityAvailableToReturn': 0,
                                                            'QuantityAvailableToCancel': 0,
                                                            'QuantityOrdered': 1,
                                                            'QuantityCanceled': 0,
                                                            'QuantityReturned': 0,
                                                            'TotalPrice': 79,
                                                            'UnitPrice': 79,
                                                            'TotalTaxAmount': 3.95,
                                                            'Type': 'Order Product',
                                                            'TypeCode': 'Product'
                                                        }, {
                                                            'attributes': {
                                                                'type': 'OrderItemSummary',
                                                                'url': '/services/data/v51.0/sobjects/OrderItemSummary/10uB0000000V7AlIAK'
                                                            },
                                                            'Id': '10uB0000000V7AlIAK',
                                                            'ProductCode': 'Standard Ground',
                                                            'OrderDeliveryGroupSummaryId': '0agB0000000V3yaIAC',
                                                            'Quantity': 1,
                                                            'QuantityAvailableToFulfill': 0,
                                                            'QuantityAvailableToReturn': 0,
                                                            'QuantityAvailableToCancel': 0,
                                                            'QuantityOrdered': 1,
                                                            'QuantityCanceled': 0,
                                                            'QuantityReturned': 0,
                                                            'TotalPrice': 5.99,
                                                            'UnitPrice': 5.99,
                                                            'TotalTaxAmount': 0.3,
                                                            'Type': 'Delivery Charge',
                                                            'TypeCode': 'Charge'
                                                        }]
                                                    }

                                                }
                                            ]
                                        }
                                    },
                                    {
                                        'body': {
                                            'totalSize': 1,
                                            'done': true,
                                            'records': [{
                                                'attributes': {
                                                    'type': 'FulfillmentOrder',
                                                    'url': '/services/data/v51.0/sobjects/FulfillmentOrder/0a3B0000000TOlUIAW'
                                                },
                                                'OrderSummaryId': '1OsB0000000V3reKAC',
                                                'Id': '0a3B0000000TOlUIAW',
                                                'DeliveryMethodId': '2DmB00000000CanKAE',
                                                'CreatedDate': '2021-03-31T15:32:54.000+0000',
                                                'ItemCount': 2,
                                                'Status': 'Allocated',
                                                'StatusCategory': 'ACTIVATED',
                                                'FulfilledToAddress': {
                                                    'city': 'Carlyle',
                                                    'country': 'US',
                                                    'geocodeAccuracy': null,
                                                    'latitude': null,
                                                    'longitude': null,
                                                    'postalCode': 'T2B 3N7',
                                                    'state': 'IL',
                                                    'street': '1890 Franklin Avenue'
                                                },
                                                'TotalAmount': 84.99,
                                                'TotalTaxAmount': 4.25,
                                                'FulfillmentOrderLineItems': {
                                                    'totalSize': 1,
                                                    'done': true,
                                                    'records': [{
                                                        'attributes': {
                                                            'type': 'FulfillmentOrderLineItem',
                                                            'url': '/services/data/v51.0/sobjects/FulfillmentOrderLineItem/0a4B0000000TPDmIAO'
                                                        },
                                                        'Id': '0a4B0000000TPDmIAO',
                                                        'OrderItemSummaryId': '10uB0000000V7AkIAK',
                                                        'Quantity': 1,
                                                        'TotalPrice': 79,
                                                        'TotalTaxAmount': 3.95
                                                    }]
                                                },
                                                'FulfillmentOrderShipments': null
                                            }]
                                        },
                                        'httpHeaders': {},
                                        'httpStatusCode': 200,
                                        'referenceId': 'refFulfillmentOrders0'
                                    }
                                ]
                            }
                        }
                    };
                },
                getOrders: function (customerNo) {
                    var somApiResponseMock = {
                        ok: true,
                        object: {
                            responseObj: {
                                compositeResponse: [
                                    {
                                        body: {
                                            records: [
                                                {
                                                    Id: 'somOrderId00001',
                                                    OrderNumber: '00001501@RefArch',
                                                    OrderedDate: '11-25-2022'
                                                },
                                                {
                                                    Id: 'somOrderId00002',
                                                    OrderNumber: '00001502@RefArch',
                                                    OrderedDate: '11-26-2022'
                                                }
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    };
                    var somApiResponseMock2 = {
                        object: {
                            responseObj: {
                                compositeResponse: [
                                    {
                                        body: {
                                            records: []
                                        }
                                    }
                                ]
                            }
                        }
                    };
                    var somApiResponseMock3 = {
                        ok: true,
                        object: {
                            responseObj: {
                                compositeResponse: [{
                                    body: {
                                        records: [{
                                            fu: 'bar'
                                        }]
                                    }
                                }]
                            }
                        }
                    };

                    var somApiResponseMock4 = {
                        ok: true,
                        object: {
                            responseObj: {
                                compositeResponse: [{
                                    body: {
                                        records: [{
                                            fu: 'bar'
                                        }]
                                    }
                                }]
                            }
                        }
                    };

                    if (customerNo === '10010101') {
                        return somApiResponseMock;
                    }

                    if (customerNo === '10010102') {
                        return somApiResponseMock3;
                    }

                    if (customerNo === '10010103') {
                        return somApiResponseMock4;
                    }

                    return somApiResponseMock2;
                },
                getOrderAndFulfillment: function (orderSummaryId, fulfillmentId) {
                    var somApiResponseMock = {
                        ok: true,
                        object: {
                            responseObj: {
                                compositeResponse: [
                                    {
                                        body: {
                                            records: [
                                                {
                                                    Id: 'somOrderId00001',
                                                    OrderNumber: '00001501@RefArch'
                                                }
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    };

                    if (orderSummaryId && fulfillmentId) {
                        return somApiResponseMock;
                    }

                    return { ok: false };
                }
            },
            '*/cartridge/scripts/helpers/somHelpers': {
                createFulfillmentOrderMapObjects: function () {
                    return {
                        orderSummaryToFulfillmentOrders: 'osToFulfillmentOrdersMap'
                    };
                },
                createOrderSummaryMapObjects: function () {
                    return {
                        orderSummaryToOrderItemSummaries: 'osToOrderItemSummariesMap'
                    };
                }
            },
            '*/cartridge/models/somOrder': function () {
                return {
                    id: 'somOrderId00001',
                    sfccOrderNumber: '00001501@RefArch'
                };
            },
            'dw/system/Logger': {
                error: logSpy
            },
            '*/cartridge/config/somPreferences': {}
        });

        it('should return an order with the property "id" to be equal to "somOrderId00001"', function () {
            var req = {
                currentCustomer: {
                    profile: {
                        customerNo: '10010101'
                    }
                }

            };
            var order = orderHelpers.getLastOrder(req);
            assert.equal(order.id, 'somOrderId00001');
        });

        it('should return an order with the property "sfccOrderNumber" to be equal to "somOrderId00001"', function () {
            var req = {
                currentCustomer: {
                    profile: {
                        customerNo: '10010101'
                    }
                }

            };
            var order = orderHelpers.getLastOrder(req);
            assert.equal(order.sfccOrderNumber, '00001501@RefArch');
        });
    });

    describe('should get null', function () {
        it('should get null as the somOrder Model', function () {
            var orderHelpers = proxyquire('../../../../../../cartridges/plugin_ordermanagement/cartridge/scripts/order/orderHelpers', {
                'dw/web/Resource': {},
                'dw/web/URLUtils': {},
                'dw/catalog/ProductMgr': {},
                '*/cartridge/scripts/helpers/productHelpers': {},
                '*/cartridge/scripts/helpers/utilHelpers': {},
                '*/cartridge/models/product/decorators/index': {},
                '*/cartridge/scripts/som': {
                    getLastOrder: function () {
                        return { ok: false };
                    }
                },
                '*/cartridge/scripts/helpers/somHelpers': {
                    createFulfillmentOrderMapObjects: function () {
                        return {};
                    },
                    createOrderSummaryMapObjects: function () {
                        return {};
                    }
                },
                '*/cartridge/models/somOrder': function () {
                    return {};
                },
                'dw/value/Money': function () {
                    return {};
                },
                'dw/system/Logger': {
                    error: logSpy
                },
                '*/cartridge/config/somPreferences': {}
            });
            var req = {
                currentCustomer: {
                    profile: {
                        email: '123@test.com'
                    }
                }
            };
            var order = orderHelpers.getLastOrder(req);
            assert.isNull(order);
        });

        it('should log an error', function () {
            var orderHelpers = proxyquire('../../../../../../cartridges/plugin_ordermanagement/cartridge/scripts/order/orderHelpers', {
                'dw/web/Resource': {},
                'dw/web/URLUtils': {},
                'dw/catalog/ProductMgr': {},
                '*/cartridge/scripts/helpers/productHelpers': {},
                '*/cartridge/scripts/helpers/utilHelpers': {},
                '*/cartridge/models/product/decorators/index': {},
                '*/cartridge/scripts/som': {
                    getLastOrder: function () {
                        return { ok: false };
                    }
                },
                '*/cartridge/scripts/helpers/somHelpers': {
                    createFulfillmentOrderMapObjects: function () {
                        return {};
                    },
                    createOrderSummaryMapObjects: function () {
                        return {};
                    }
                },
                '*/cartridge/models/somOrder': function () {
                    return {};
                },
                'dw/value/Money': function () {
                    return {};
                },
                'dw/system/Logger': {
                    error: logSpy
                },
                '*/cartridge/config/somPreferences': {}
            });
            var req = {
                currentCustomer: {
                    profile: {
                        email: '123@test.com'
                    }
                }
            };
            // eslint-disable-next-line no-unused-vars
            var order = orderHelpers.getLastOrder(req);
            assert.isTrue(logSpy.calledOnce);
        });
    });
});
