'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var mockCollections = require('../../../mocks/util/collections');
var sinon = require('sinon');
var logSpy;
var LoggerSpy;

function getExtraLongString() {
    return 'a'.repeat(1e5);
}

function createOrdersMock(size) {
    var orders = [];
    for (var i = 1; i <= size; i += 1) {
        orders.push({
            Id: 'orderID_' + i,
            orderNo: 'orderID_' + i
        });
    }
    orders.getCount = function () {
        return this.length;
    };
    orders.first = function () {
        return orders[0];
    };
    return orders;
}

function createCustomerMock(orders) {
    return {
        getOrderHistory: function () {
            return {
                getOrders: function () {
                    return orders;
                }
            };
        }
    };
}

var somMock = {
    'somServiceMgr': {
        restComposite: function () {
            var svc = {
                call: function () {
                    return 'payload';
                }
            };
            return svc;
        },
        restEndpoints: {
            query: 'myQuery'
        }
    },
    'somServiceMgr2': {
        numberofcalls: 0,
        returnedObject: {
            ok: true,
            object: {
                responseObj: {
                    compositeResponse: [
                        {
                            body: {
                                records: [{
                                    'Id': 'ID1'
                                }, {
                                    'Id': 'ID2'
                                }, {
                                    'Id': 'ID3'
                                }, {
                                    'Id': 'ID4'
                                }, {
                                    'Id': 'ID5'
                                }]
                            }
                        }
                    ]
                }
            }
        },
        restComposite: function () {
            var result;
            var svc = {
                call: function () {
                    return result;
                }
            };

            if (this.numberofcalls === 0) {
                this.numberofcalls++;
                result = this.returnedObject;
                return svc;
            }
            this.numberofcalls++;
            svc = {
                call: function () {
                    return {
                        object: {
                            responseObj: {
                                compositeResponse: [
                                    'fulfillmentPayload'
                                ]
                            }
                        }
                    };
                }
            };

            return svc;
        },
        restEndpoints: {
            query: 'myQuery'
        }
    },
    'somServiceMgr3': {
        numberofcalls: 0,
        returnedObject: {
            ok: true,
            object: {
                responseObj: {
                    compositeResponse: [
                        {
                            body: {
                                records: [
                                    {
                                        'Id': 'ID1'
                                    },
                                    {
                                        'Id': 'ID2'
                                    }
                                ],
                                totalSize: 2
                            },

                            httpStatusCode: 200
                        },
                        {
                            body: {
                                records: [{
                                    'FId': 'FID1'
                                }]
                            },
                            httpStatusCode: 200
                        },
                        {
                            body: {
                                records: [{
                                    'FId': 'FID2'
                                }]
                            },
                            httpStatusCode: 200
                        }
                    ]
                }
            }
        },
        restComposite: function () {
            var result;
            var svc = {
                call: function () {
                    return result;
                }
            };

            if (this.numberofcalls === 0) {
                this.numberofcalls++;
                result = this.returnedObject;
                return svc;
            }
            this.numberofcalls++;
            svc = {
                call: function () {
                    return {
                        object: {
                            responseObj: {
                                compositeResponse: [
                                    'fulfillmentPayload'
                                ]
                            }
                        }
                    };
                }
            };

            return svc;
        },
        restEndpoints: {
            query: 'myQuery'
        }
    },
    'collections': {
        map: mockCollections.map
    },
    'somPreferences': {},
    'somPreferences2': {
        orderHistoryQuery: {
            orderItemSummaries: getExtraLongString(),
            orderDeliveryGroupSummaries: 'def',
            fulfillmentOrderLineItems: getExtraLongString(),
            fulfillmentOrderShipments: '456'
        }
    },
    'somPreferences3': {
        orderHistoryQuery: {
            orderItemSummaries: '',
            orderDeliveryGroupSummaries: 'def',
            fulfillmentOrderLineItems: getExtraLongString(),
            fulfillmentOrderShipments: '456'
        }
    },
    'Order': {},
    'Logger': {
        error: function (text) {
            return text;
        }
    }
};

describe('som', function () {
    beforeEach(function () {
        logSpy = sinon.spy();
        LoggerSpy = { error: logSpy };
    });

    describe('getLastOrder', function () {
        it('should return last order query', function () {
            var som = proxyquire('../../../../cartridges/plugin_ordermanagement/cartridge/scripts/som', {
                '*/cartridge/scripts/services/somServiceMgr': somMock.somServiceMgr,
                '*/cartridge/scripts/util/collections': somMock.collections,
                '*/cartridge/config/somPreferences': somMock.somPreferences,
                'dw/order/Order': somMock.Order,
                'dw/system/Logger': LoggerSpy
            });
            var orders = createOrdersMock(1);
            var customer = createCustomerMock(orders);
            var result = som.getLastOrder(customer);
            assert.isTrue(logSpy.notCalled);
            assert.equal(result, 'payload');
        });

        it('should log an error message if query where length is over 4000 characters long and return undefined', function () {
            var som = proxyquire('../../../../cartridges/plugin_ordermanagement/cartridge/scripts/som', {
                '*/cartridge/scripts/services/somServiceMgr': somMock.somServiceMgr,
                '*/cartridge/scripts/util/collections': somMock.collections,
                '*/cartridge/config/somPreferences': somMock.somPreferences2,
                'dw/order/Order': somMock.Order,
                'dw/system/Logger': LoggerSpy
            });
            var orders = createOrdersMock(1);
            orders[0].orderNo = '0'.repeat(120);
            var customer = createCustomerMock(orders);
            var result = som.getLastOrder(customer);
            assert.isTrue(logSpy.calledOnce);
            assert.equal(result, undefined);
        });

        it('should log an error message if the length order summary query is over 100000 characters', function () {
            var som = proxyquire('../../../../cartridges/plugin_ordermanagement/cartridge/scripts/som', {
                '*/cartridge/scripts/services/somServiceMgr': somMock.somServiceMgr,
                '*/cartridge/scripts/util/collections': somMock.collections,
                '*/cartridge/config/somPreferences': somMock.somPreferences2,
                'dw/order/Order': somMock.Order,
                'dw/system/Logger': LoggerSpy
            });
            var orders = createOrdersMock(1);
            var customer = createCustomerMock(orders);
            var result = som.getLastOrder(customer);
            assert.isTrue(logSpy.calledOnce);
            assert.equal(result, undefined);
        });

        it('should return undefined if there is no order', function () {
            var som = proxyquire('../../../../cartridges/plugin_ordermanagement/cartridge/scripts/som', {
                '*/cartridge/scripts/services/somServiceMgr': somMock.somServiceMgr,
                '*/cartridge/scripts/util/collections': somMock.collections,
                '*/cartridge/config/somPreferences': somMock.somPreferences,
                'dw/order/Order': somMock.Order,
                'dw/system/Logger': LoggerSpy
            });
            var orders = createOrdersMock(0);
            var customer = createCustomerMock(orders);
            var result = som.getLastOrder(customer);
            assert.equal(result, undefined);
        });

        it('should log an error message if the length fulfillment query is over 100000 characters', function () {
            var som = proxyquire('../../../../cartridges/plugin_ordermanagement/cartridge/scripts/som', {
                '*/cartridge/scripts/services/somServiceMgr': somMock.somServiceMgr,
                '*/cartridge/scripts/util/collections': somMock.collections,
                '*/cartridge/config/somPreferences': somMock.somPreferences3,
                'dw/order/Order': somMock.Order,
                'dw/system/Logger': LoggerSpy
            });
            var orders = createOrdersMock(1);
            var customer = createCustomerMock(orders);
            var result = som.getLastOrder(customer);
            assert.isTrue(logSpy.calledOnce);
            assert.equal(result, undefined);
        });
    });

    describe('getOrders', function () {
        it('should return list of orders query, using query in config with 2 orders and 2 fulfillments', function () {
            var som = proxyquire('../../../../cartridges/plugin_ordermanagement/cartridge/scripts/som', {
                '*/cartridge/scripts/services/somServiceMgr': somMock.somServiceMgr3,
                '*/cartridge/scripts/util/collections': somMock.collections,
                '*/cartridge/config/somPreferences': somMock.somPreferences,
                'dw/order/Order': somMock.Order,
                'dw/system/Logger': LoggerSpy
            });
            var orders = createOrdersMock(2);
            var customer = createCustomerMock(orders);
            var apiResponse = som.getOrders(customer);
            assert.isTrue(logSpy.notCalled);
            assert.equal(apiResponse.object.responseObj.compositeResponse.length, 3);
            assert.equal(apiResponse.object.responseObj.compositeResponse[0].body.records.length, 2);
            assert.equal(apiResponse.object.responseObj.compositeResponse[0].body.records[0].Id, 'ID1');
            assert.equal(apiResponse.object.responseObj.compositeResponse[0].body.records[1].Id, 'ID2');
            assert.equal(apiResponse.object.responseObj.compositeResponse[1].body.records[0].FId, 'FID1');
            assert.equal(apiResponse.object.responseObj.compositeResponse[1].body.records[1].FId, 'FID2');
        });

        it('should return list of orders query, using query in config with 5 orders', function () {
            var som = proxyquire('../../../../cartridges/plugin_ordermanagement/cartridge/scripts/som', {
                '*/cartridge/scripts/services/somServiceMgr': somMock.somServiceMgr2,
                '*/cartridge/scripts/util/collections': somMock.collections,
                '*/cartridge/config/somPreferences': somMock.somPreferences,
                'dw/order/Order': somMock.Order,
                'dw/system/Logger': somMock.Logger
            });
            var orders = createOrdersMock(5);
            var customer = createCustomerMock(orders);
            var apiResponse = som.getOrders(customer);
            assert.equal(apiResponse.ok, true);
            assert.equal(apiResponse.object.responseObj.compositeResponse[1], 'fulfillmentPayload');
            assert.equal(apiResponse.object.responseObj.compositeResponse[0].body.records.length, 5);
        });

        it('should log an error message if query where length is over 4000 characters long and return undefined', function () {
            var som = proxyquire('../../../../cartridges/plugin_ordermanagement/cartridge/scripts/som', {
                '*/cartridge/scripts/services/somServiceMgr': somMock.somServiceMgr,
                '*/cartridge/scripts/util/collections': somMock.collections,
                '*/cartridge/config/somPreferences': somMock.somPreferences2,
                'dw/order/Order': somMock.Order,
                'dw/system/Logger': LoggerSpy
            });
            var orders = createOrdersMock(1);
            orders[0].orderNo = '1'.repeat(120);
            var customer = createCustomerMock(orders);
            var apiResponse = som.getOrders(customer);
            assert.isTrue(logSpy.calledTwice);
            assert.equal(apiResponse, undefined);
        });

        it('should log an error message if the length order summary query is over 100000 characters', function () {
            var som = proxyquire('../../../../cartridges/plugin_ordermanagement/cartridge/scripts/som', {
                '*/cartridge/scripts/services/somServiceMgr': somMock.somServiceMgr,
                '*/cartridge/scripts/util/collections': somMock.collections,
                '*/cartridge/config/somPreferences': somMock.somPreferences2,
                'dw/order/Order': somMock.Order,
                'dw/system/Logger': LoggerSpy
            });
            var orders = createOrdersMock(1);
            var customer = createCustomerMock(orders);
            var apiResponse = som.getOrders(customer);
            assert.isTrue(logSpy.calledTwice);
            assert.equal(apiResponse, undefined);
        });

        it('should return undefined if there are no orders placed for this account', function () {
            var som = proxyquire('../../../../cartridges/plugin_ordermanagement/cartridge/scripts/som', {
                '*/cartridge/scripts/services/somServiceMgr': somMock.somServiceMgr,
                '*/cartridge/scripts/util/collections': somMock.collections,
                '*/cartridge/config/somPreferences': somMock.somPreferences,
                'dw/order/Order': somMock.Order,
                'dw/system/Logger': LoggerSpy
            });
            var orders = createOrdersMock(0);
            var customer = createCustomerMock(orders);
            var apiResponse = som.getOrders(customer);
            assert.isTrue(logSpy.notCalled);
            assert.equal(apiResponse, undefined);
        });

        it('should log an error message if the length order summary query is over 100000 characters when trying to get orders', function () {
            var som = proxyquire('../../../../cartridges/plugin_ordermanagement/cartridge/scripts/som', {
                '*/cartridge/scripts/services/somServiceMgr': somMock.somServiceMgr,
                '*/cartridge/scripts/util/collections': somMock.collections,
                '*/cartridge/config/somPreferences': somMock.somPreferences2,
                'dw/order/Order': somMock.Order,
                'dw/system/Logger': LoggerSpy
            });
            var orders = createOrdersMock(2);
            var customer = createCustomerMock(orders);
            var apiResponse = som.getOrders(customer);
            assert.isTrue(logSpy.calledTwice);
            assert.equal(apiResponse, undefined);
        });
    });

    describe('getOrderAndFulfillment', function () {
        it('should return the response for the specified orderSummaryId and fulfillmentId', function () {
            var som = proxyquire('../../../../cartridges/plugin_ordermanagement/cartridge/scripts/som', {
                '*/cartridge/scripts/services/somServiceMgr': somMock.somServiceMgr,
                '*/cartridge/scripts/util/collections': somMock.collections,
                '*/cartridge/config/somPreferences': somMock.somPreferences,
                'dw/order/Order': somMock.Order,
                'dw/system/Logger': somMock.Logger
            });
            var query = som.getOrderAndFulfillment('orderSummaryId', 'fulfillmentId');
            assert.equal(query, 'payload');
        });

        it('should return the response for the specified orderSummaryId', function () {
            var som = proxyquire('../../../../cartridges/plugin_ordermanagement/cartridge/scripts/som', {
                '*/cartridge/scripts/services/somServiceMgr': somMock.somServiceMgr,
                '*/cartridge/scripts/util/collections': somMock.collections,
                '*/cartridge/config/somPreferences': somMock.somPreferences,
                'dw/order/Order': somMock.Order,
                'dw/system/Logger': somMock.Logger
            });
            var query = som.getOrderAndFulfillment('orderSummaryId', null);
            assert.equal(query, 'payload');
        });

        it('should log an error message if the length order summary query is over 100000 characters', function () {
            var som = proxyquire('../../../../cartridges/plugin_ordermanagement/cartridge/scripts/som', {
                '*/cartridge/scripts/services/somServiceMgr': somMock.somServiceMgr,
                '*/cartridge/scripts/util/collections': somMock.collections,
                '*/cartridge/config/somPreferences': somMock.somPreferences2,
                'dw/order/Order': somMock.Order,
                'dw/system/Logger': {
                    error: logSpy
                }
            });
            var result = som.getOrderAndFulfillment('orderSummaryId', 'fulfillmentId');
            assert.isTrue(logSpy.calledOnce);
            assert.equal(result, undefined);
        });

        it('should log an error message if the length fulfillment query is over 100000 characters', function () {
            var som = proxyquire('../../../../cartridges/plugin_ordermanagement/cartridge/scripts/som', {
                '*/cartridge/scripts/services/somServiceMgr': somMock.somServiceMgr,
                '*/cartridge/scripts/util/collections': somMock.collections,
                '*/cartridge/config/somPreferences': somMock.somPreferences3,
                'dw/order/Order': somMock.Order,
                'dw/system/Logger': {
                    error: logSpy
                }
            });
            var result = som.getOrderAndFulfillment('orderSummaryId', 'fulfillmentId');
            assert.isTrue(logSpy.calledOnce);
            assert.equal(result, undefined);
        });
    });

    describe('getOrderSummaryQuery', function () {
        it('should perform a search with the year property of the filters object in the WHERE statement', function () {
            var som = proxyquire('../../../../cartridges/plugin_ordermanagement/cartridge/scripts/som', {
                '*/cartridge/scripts/services/somServiceMgr': somMock.somServiceMgr,
                '*/cartridge/scripts/util/collections': somMock.collections,
                '*/cartridge/config/somPreferences': somMock.somPreferences,
                'dw/order/Order': somMock.Order,
                'dw/system/Logger': somMock.Logger
            });

            var filters = {
                year: 2019
            };

            var query = som.getOrderSummaryQuery(['0001', '0002'], 'orderSummaryId', filters);
            assert.typeOf(query, 'string');
            assert.equal(query, 'SELECT+Id,+AccountId,+OrderNumber,+OrderedDate,+Status,+BillingAddress,+BillingPhoneNumber,+BillingEmailAddress,+GrandTotalAmount,+TotalAmount,+TotalTaxAmount,+TotalAdjustedDeliveryAmount,+TotalAdjustedProductAmount,+TotalDeliveryAdjDistAmount,+TotalProductAdjDistAmount,+(SELECT+OrderPaymentSummary.PaymentMethodId,+OrderPaymentSummary.FullName,+OrderPaymentSummary.Method+FROM+OrderPaymentSummaries),+(SELECT+OrderItemSummary.Id,OrderItemSummary.ProductCode,OrderItemSummary.Description,OrderItemSummary.OrderDeliveryGroupSummaryId,OrderItemSummary.Quantity,OrderItemSummary.QuantityAvailableToFulfill,OrderItemSummary.QuantityAvailableToCancel,OrderItemSummary.QuantityAvailableToReturn,OrderItemSummary.QuantityOrdered,OrderItemSummary.QuantityCanceled,OrderItemSummary.QuantityReturned,OrderItemSummary.TotalPrice,OrderItemSummary.UnitPrice,OrderItemSummary.TotalTaxAmount,OrderItemSummary.Type,OrderItemSummary.TypeCode+FROM+OrderItemSummaries),+(SELECT+OrderDeliveryGroupSummary.id,+OrderDeliveryGroupSummary.DeliverToName,+OrderDeliveryGroupSummary.DeliverToAddress,OrderDeliveryGroupSummary.OrderDeliveryMethodId+OrderDeliveryGroupSummary.PhoneNumber+OrderDeliveryGroupSummary.EmailAddress+FROM+OrderDeliveryGroupSummaries)+FROM+OrderSummary+WHERE+OrderNumber+IN+(+\'0001\',\'0002\'+)+AND+CALENDAR_YEAR(OrderedDate)+=+2019+ORDER+BY+OrderedDate+DESC+NULLS+LAST');
        });

        it('should perform a search with the fromDate property of the filters object in the WHERE statement', function () {
            var som = proxyquire('../../../../cartridges/plugin_ordermanagement/cartridge/scripts/som', {
                '*/cartridge/scripts/services/somServiceMgr': somMock.somServiceMgr,
                '*/cartridge/scripts/util/collections': somMock.collections,
                '*/cartridge/config/somPreferences': somMock.somPreferences,
                'dw/order/Order': somMock.Order,
                'dw/system/Logger': somMock.Logger
            });

            var filters = {
                fromDate: '2020-06-28T00:00:00.000Z'
            };

            var query = som.getOrderSummaryQuery(['0001', '0002'], 'orderSummaryId', filters);
            assert.typeOf(query, 'string');
            assert.equal(query, 'SELECT+Id,+AccountId,+OrderNumber,+OrderedDate,+Status,+BillingAddress,+BillingPhoneNumber,+BillingEmailAddress,+GrandTotalAmount,+TotalAmount,+TotalTaxAmount,+TotalAdjustedDeliveryAmount,+TotalAdjustedProductAmount,+TotalDeliveryAdjDistAmount,+TotalProductAdjDistAmount,+(SELECT+OrderPaymentSummary.PaymentMethodId,+OrderPaymentSummary.FullName,+OrderPaymentSummary.Method+FROM+OrderPaymentSummaries),+(SELECT+OrderItemSummary.Id,OrderItemSummary.ProductCode,OrderItemSummary.Description,OrderItemSummary.OrderDeliveryGroupSummaryId,OrderItemSummary.Quantity,OrderItemSummary.QuantityAvailableToFulfill,OrderItemSummary.QuantityAvailableToCancel,OrderItemSummary.QuantityAvailableToReturn,OrderItemSummary.QuantityOrdered,OrderItemSummary.QuantityCanceled,OrderItemSummary.QuantityReturned,OrderItemSummary.TotalPrice,OrderItemSummary.UnitPrice,OrderItemSummary.TotalTaxAmount,OrderItemSummary.Type,OrderItemSummary.TypeCode+FROM+OrderItemSummaries),+(SELECT+OrderDeliveryGroupSummary.id,+OrderDeliveryGroupSummary.DeliverToName,+OrderDeliveryGroupSummary.DeliverToAddress,OrderDeliveryGroupSummary.OrderDeliveryMethodId+OrderDeliveryGroupSummary.PhoneNumber+OrderDeliveryGroupSummary.EmailAddress+FROM+OrderDeliveryGroupSummaries)+FROM+OrderSummary+WHERE+OrderNumber+IN+(+\'0001\',\'0002\'+)+AND+OrderedDate+>+2020-06-28T00:00:00.000Z+ORDER+BY+OrderedDate+DESC+NULLS+LAST');
        });
    });
});
