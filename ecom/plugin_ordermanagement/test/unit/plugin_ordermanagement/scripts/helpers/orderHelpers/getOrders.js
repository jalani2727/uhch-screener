var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');
var logSpy;
var orderHelpers = proxyquire('../../../../../../cartridges/plugin_ordermanagement/cartridge/scripts/order/orderHelpers', {

    'dw/web/Resource': {},
    'dw/web/URLUtils': {},
    'dw/catalog/ProductMgr': {},
    '*/cartridge/scripts/helpers/productHelpers': {},
    '*/cartridge/scripts/helpers/utilHelpers': {},
    '*/cartridge/models/product/decorators/index': {},
    '*/cartridge/scripts/som': {
        getOrders: function () {
            var somApiResponseMock = {
                ok: true,
                object: {
                    responseObj: {
                        'compositeResponse': [{
                            'body': {
                                'totalSize': 3,
                                'done': true,
                                'records': [{
                                    'Id': '1OsB0000000V3reKAC',
                                    'AccountId': '001B000001MTjsAIAT',
                                    'OrderNumber': 'zzel05-00001402',
                                    'OrderedDate': '2021-03-31T15:32:31.000+0000',
                                    'Status': 'Waiting to Fulfill',
                                    'BillingAddress': {
                                        'city': 'Carlyle',
                                        'country': 'US',
                                        'geocodeAccuracy': null,
                                        'latitude': null,
                                        'longitude': null,
                                        'postalCode': 'T2B 3N7',
                                        'state': 'IL',
                                        'street': '1890 Franklin Avenue'
                                    },
                                    'BillingPhoneNumber': '1234123456',
                                    'BillingEmailAddress': 'o.beliaiev+1@astoundcommerce.com',
                                    'GrandTotalAmount': 89.24,
                                    'TotalAmount': 84.99,
                                    'TotalTaxAmount': 4.25,
                                    'TotalAdjustedDeliveryAmount': 5.99,
                                    'TotalAdjustedProductAmount': 79,
                                    'TotalDeliveryAdjDistAmount': 0,
                                    'TotalProductAdjDistAmount': 0,
                                    'OrderPaymentSummaries': {
                                        'totalSize': 1,
                                        'done': true,
                                        'records': [{
                                            'PaymentMethodId': '03OB0000000Uw3nMAC',
                                            'FullName': 'Test Test',
                                            'Method': 'Visa - 1111'
                                        }]
                                    },
                                    'OrderItemSummaries': {
                                        'totalSize': 2,
                                        'done': true,
                                        'records': [{
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
                                    },
                                    'OrderDeliveryGroupSummaries': {
                                        'totalSize': 1,
                                        'done': true,
                                        'records': [{
                                            'Id': '0agB0000000V3yaIAC',
                                            'DeliverToName': 'Test Test',
                                            'DeliverToAddress': {
                                                'city': 'Carlyle',
                                                'country': 'US',
                                                'geocodeAccuracy': null,
                                                'latitude': null,
                                                'longitude': null,
                                                'postalCode': 'T2B 3N7',
                                                'state': 'IL',
                                                'street': '1890 Franklin Avenue'
                                            },
                                            'OrderDeliveryMethodId': '2DmB00000000CanKAE'
                                        }]
                                    }
                                }, {
                                    'Id': '1OsB0000000V3lqKAC',
                                    'AccountId': '001B000001MTjsAIAT',
                                    'OrderNumber': 'zzel05-00001401',
                                    'OrderedDate': '2021-03-31T13:33:35.000+0000',
                                    'Status': 'Waiting to Fulfill',
                                    'BillingAddress': {
                                        'city': 'Carlyle',
                                        'country': 'US',
                                        'geocodeAccuracy': null,
                                        'latitude': null,
                                        'longitude': null,
                                        'postalCode': '62231-1729',
                                        'state': 'IL',
                                        'street': '1890 Franklin Avenue'
                                    },
                                    'BillingPhoneNumber': '4178201495',
                                    'BillingEmailAddress': 'o.beliaiev+1@astoundcommerce.com',
                                    'GrandTotalAmount': 216.29,
                                    'TotalAmount': 205.99,
                                    'TotalTaxAmount': 10.3,
                                    'TotalAdjustedDeliveryAmount': 7.99,
                                    'TotalAdjustedProductAmount': 198,
                                    'TotalDeliveryAdjDistAmount': 0,
                                    'TotalProductAdjDistAmount': 0,
                                    'OrderPaymentSummaries': {
                                        'totalSize': 1,
                                        'done': true,
                                        'records': [{
                                            'PaymentMethodId': '03OB0000000UvxzMAC',
                                            'FullName': 'Test Test',
                                            'Method': 'Visa - 1111'
                                        }]
                                    },
                                    'OrderItemSummaries': {
                                        'totalSize': 2,
                                        'done': true,
                                        'records': [{
                                            'Id': '10uB0000000V74wIAC',
                                            'ProductCode': '726819487817M',
                                            'OrderDeliveryGroupSummaryId': '0agB0000000V3smIAC',
                                            'Quantity': 2,
                                            'QuantityAvailableToFulfill': 0,
                                            'QuantityAvailableToReturn': 0,
                                            'QuantityAvailableToCancel': 0,
                                            'QuantityOrdered': 2,
                                            'QuantityCanceled': 0,
                                            'QuantityReturned': 0,
                                            'TotalPrice': 198,
                                            'UnitPrice': 99,
                                            'TotalTaxAmount': 9.9,
                                            'Type': 'Order Product',
                                            'TypeCode': 'Product'
                                        }, {
                                            'Id': '10uB0000000V74xIAC',
                                            'ProductCode': 'Standard Ground',
                                            'OrderDeliveryGroupSummaryId': '0agB0000000V3smIAC',
                                            'Quantity': 1,
                                            'QuantityAvailableToFulfill': 0,
                                            'QuantityAvailableToReturn': 0,
                                            'QuantityAvailableToCancel': 0,
                                            'QuantityOrdered': 1,
                                            'QuantityCanceled': 0,
                                            'QuantityReturned': 0,
                                            'TotalPrice': 7.99,
                                            'UnitPrice': 7.99,
                                            'TotalTaxAmount': 0.4,
                                            'Type': 'Delivery Charge',
                                            'TypeCode': 'Charge'
                                        }]
                                    },
                                    'OrderDeliveryGroupSummaries': {
                                        'totalSize': 1,
                                        'done': true,
                                        'records': [{
                                            'Id': '0agB0000000V3smIAC',
                                            'DeliverToName': 'Test Test',
                                            'DeliverToAddress': {
                                                'city': 'Carlyle',
                                                'country': 'US',
                                                'geocodeAccuracy': null,
                                                'latitude': null,
                                                'longitude': null,
                                                'postalCode': '62231-1729',
                                                'state': 'IL',
                                                'street': '1890 Franklin Avenue'
                                            },
                                            'OrderDeliveryMethodId': '2DmB00000000CanKAE'
                                        }]
                                    }
                                }, {
                                    'Id': '1OsB0000000Uy3AKAS',
                                    'AccountId': '001B000001MTjsAIAT',
                                    'OrderNumber': 'zzel05-00001301',
                                    'OrderedDate': '2021-03-26T09:40:35.000+0000',
                                    'Status': 'Waiting to Fulfill',
                                    'BillingAddress': {
                                        'city': 'Carlyle',
                                        'country': 'US',
                                        'geocodeAccuracy': null,
                                        'latitude': null,
                                        'longitude': null,
                                        'postalCode': '62231-1729',
                                        'state': 'IL',
                                        'street': '1890 Franklin Avenue'
                                    },
                                    'BillingPhoneNumber': '1234512345',
                                    'BillingEmailAddress': 'o.beliaiev+1@astoundcommerce.com',
                                    'GrandTotalAmount': 110.24,
                                    'TotalAmount': 104.99,
                                    'TotalTaxAmount': 5.25,
                                    'TotalAdjustedDeliveryAmount': 5.99,
                                    'TotalAdjustedProductAmount': 99,
                                    'TotalDeliveryAdjDistAmount': 0,
                                    'TotalProductAdjDistAmount': 0,
                                    'OrderPaymentSummaries': {
                                        'totalSize': 1,
                                        'done': true,
                                        'records': [{
                                            'PaymentMethodId': '03OB0000000UqIIMA0',
                                            'FullName': 'Test Test',
                                            'Method': 'Visa - 1111'
                                        }]
                                    },
                                    'OrderItemSummaries': {
                                        'totalSize': 2,
                                        'done': true,
                                        'records': [{
                                            'Id': '10uB0000000V16AIAS',
                                            'ProductCode': '726819487817M',
                                            'OrderDeliveryGroupSummaryId': '0agB0000000UyA6IAK',
                                            'Quantity': 1,
                                            'QuantityAvailableToFulfill': 0,
                                            'QuantityAvailableToReturn': 0,
                                            'QuantityAvailableToCancel': 0,
                                            'QuantityOrdered': 1,
                                            'QuantityCanceled': 0,
                                            'QuantityReturned': 0,
                                            'TotalPrice': 99,
                                            'UnitPrice': 99,
                                            'TotalTaxAmount': 4.95,
                                            'Type': 'Order Product',
                                            'TypeCode': 'Product'
                                        }, {
                                            'Id': '10uB0000000V16BIAS',
                                            'ProductCode': 'Standard Ground',
                                            'OrderDeliveryGroupSummaryId': '0agB0000000UyA6IAK',
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
                                    },
                                    'OrderDeliveryGroupSummaries': {
                                        'totalSize': 1,
                                        'done': true,
                                        'records': [{
                                            'Id': '0agB0000000UyA6IAK',
                                            'DeliverToName': 'Test Test',
                                            'DeliverToAddress': {
                                                'city': 'Carlyle',
                                                'country': 'US',
                                                'geocodeAccuracy': null,
                                                'latitude': null,
                                                'longitude': null,
                                                'postalCode': '62231-1729',
                                                'state': 'IL',
                                                'street': '1890 Franklin Avenue'
                                            },
                                            'OrderDeliveryMethodId': '2DmB00000000CanKAE'
                                        }]
                                    }
                                }]
                            },
                            'httpHeaders': {},
                            'httpStatusCode': 200,
                            'referenceId': 'refOrderSummaries'
                        }, {
                            'body': {
                                'totalSize': 1,
                                'done': true,
                                'records': [{
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
                                            'Id': '0a4B0000000TPDmIAO',
                                            'OrderItemSummaryId': '10uB0000000V7AkIAK',
                                            'Quantity': 1,
                                            'TotalPrice': 79,
                                            'TotalTaxAmount': 3.95
                                        }]
                                    },
                                    'FulfillmentOrderShipments': null
                                }, {
                                    'OrderSummaryId': '1OsB0000000V3lqKAC',
                                    'Id': '0a3B0000000TOlPIAW',
                                    'DeliveryMethodId': '2DmB00000000CanKAE',
                                    'CreatedDate': '2021-03-31T13:34:26.000+0000',
                                    'ItemCount': 3,
                                    'Status': 'Allocated',
                                    'StatusCategory': 'ACTIVATED',
                                    'FulfilledToAddress': {
                                        'city': 'Carlyle',
                                        'country': 'US',
                                        'geocodeAccuracy': null,
                                        'latitude': null,
                                        'longitude': null,
                                        'postalCode': '62231-1729',
                                        'state': 'IL',
                                        'street': '1890 Franklin Avenue'
                                    },
                                    'TotalAmount': 205.99,
                                    'TotalTaxAmount': 10.3,
                                    'FulfillmentOrderLineItems': {
                                        'totalSize': 1,
                                        'done': true,
                                        'records': [{
                                            'Id': '0a4B0000000TPDhIAO',
                                            'OrderItemSummaryId': '10uB0000000V74wIAC',
                                            'Quantity': 2,
                                            'TotalPrice': 198,
                                            'TotalTaxAmount': 9.9
                                        }]
                                    },
                                    'FulfillmentOrderShipments': null
                                }, {
                                    'OrderSummaryId': '1OsB0000000Uy3AKAS',
                                    'Id': '0a3B0000000TOQgIAO',
                                    'DeliveryMethodId': '2DmB00000000CanKAE',
                                    'CreatedDate': '2021-03-26T09:41:24.000+0000',
                                    'ItemCount': 2,
                                    'Status': 'Allocated',
                                    'StatusCategory': 'ACTIVATED',
                                    'FulfilledToAddress': {
                                        'city': 'Carlyle',
                                        'country': 'US',
                                        'geocodeAccuracy': null,
                                        'latitude': null,
                                        'longitude': null,
                                        'postalCode': '62231-1729',
                                        'state': 'IL',
                                        'street': '1890 Franklin Avenue'
                                    },
                                    'TotalAmount': 104.99,
                                    'TotalTaxAmount': 5.25,
                                    'FulfillmentOrderLineItems': {
                                        'totalSize': 1,
                                        'done': true,
                                        'records': [{
                                            'Id': '0a4B0000000TOsyIAG',
                                            'OrderItemSummaryId': '10uB0000000V16AIAS',
                                            'Quantity': 1,
                                            'TotalPrice': 99,
                                            'TotalTaxAmount': 4.95
                                        }]
                                    },
                                    'FulfillmentOrderShipments': null
                                }]
                            }
                        }, {
                            'body': {
                                'totalSize': 1,
                                'done': true,
                                'records': [{
                                    'OrderSummaryId': '1OsB0000000V3lqKAC',
                                    'Id': '0a3B0000000TOlPIAW',
                                    'DeliveryMethodId': '2DmB00000000CanKAE',
                                    'CreatedDate': '2021-03-31T13:34:26.000+0000',
                                    'ItemCount': 3,
                                    'Status': 'Allocated',
                                    'StatusCategory': 'ACTIVATED',
                                    'FulfilledToAddress': {
                                        'city': 'Carlyle',
                                        'country': 'US',
                                        'geocodeAccuracy': null,
                                        'latitude': null,
                                        'longitude': null,
                                        'postalCode': '62231-1729',
                                        'state': 'IL',
                                        'street': '1890 Franklin Avenue'
                                    },
                                    'TotalAmount': 205.99,
                                    'TotalTaxAmount': 10.3,
                                    'FulfillmentOrderLineItems': {
                                        'totalSize': 1,
                                        'done': true,
                                        'records': [{
                                            'Id': '0a4B0000000TPDhIAO',
                                            'OrderItemSummaryId': '10uB0000000V74wIAC',
                                            'Quantity': 2,
                                            'TotalPrice': 198,
                                            'TotalTaxAmount': 9.9
                                        }]
                                    },
                                    'FulfillmentOrderShipments': null
                                }]
                            },
                            'httpHeaders': {},
                            'httpStatusCode': 200,
                            'referenceId': 'refFulfillmentOrders1'
                        }, {
                            'body': {
                                'totalSize': 1,
                                'done': true,
                                'records': [{
                                    'OrderSummaryId': '1OsB0000000Uy3AKAS',
                                    'Id': '0a3B0000000TOQgIAO',
                                    'DeliveryMethodId': '2DmB00000000CanKAE',
                                    'CreatedDate': '2021-03-26T09:41:24.000+0000',
                                    'ItemCount': 2,
                                    'Status': 'Allocated',
                                    'StatusCategory': 'ACTIVATED',
                                    'FulfilledToAddress': {
                                        'city': 'Carlyle',
                                        'country': 'US',
                                        'geocodeAccuracy': null,
                                        'latitude': null,
                                        'longitude': null,
                                        'postalCode': '62231-1729',
                                        'state': 'IL',
                                        'street': '1890 Franklin Avenue'
                                    },
                                    'TotalAmount': 104.99,
                                    'TotalTaxAmount': 5.25,
                                    'FulfillmentOrderLineItems': {
                                        'totalSize': 1,
                                        'done': true,
                                        'records': [{
                                            'Id': '0a4B0000000TOsyIAG',
                                            'OrderItemSummaryId': '10uB0000000V16AIAS',
                                            'Quantity': 1,
                                            'TotalPrice': 99,
                                            'TotalTaxAmount': 4.95
                                        }]
                                    },
                                    'FulfillmentOrderShipments': null
                                }]
                            }
                        }]
                    }
                }
            };

            return somApiResponseMock;
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
    'dw/system/Logger': {},
    '*/cartridge/config/somPreferences': {}
});


describe('orderHelpers.getOrders', function () {
    describe('should get the orders for a given customer using 2 requests', function () {
        it('should return order array with first item id of which is equal to "somOrderId00001"', function () {
            var currentCustomer = {
                profile: {
                    customerNo: '10010102'
                }
            };
            var ordersObj = orderHelpers.getOrders(currentCustomer);
            assert.equal(ordersObj.orders[0].id, 'somOrderId00001');
        });
        it('should return order array with first item id of which is equal to "00001501@RefArch"', function () {
            var currentCustomer = {
                profile: {
                    customerNo: '10010102'
                }
            };
            var ordersObj = orderHelpers.getOrders(currentCustomer);
            assert.equal(ordersObj.orders[0].sfccOrderNumber, '00001501@RefArch');
        });
    });

    describe('should get the orders for a given customer using 1 request', function () {
        it('should return order array with first item id of which is equal to "somOrderId00001"', function () {
            var currentCustomer = {
                profile: {
                    customerNo: '10010103'
                }
            };
            var ordersObj = orderHelpers.getOrders(currentCustomer);
            assert.equal(ordersObj.orders[0].sfccOrderNumber, '00001501@RefArch');
        });
        it('should return order array with first item id of which is equal to "00001501"', function () {
            var currentCustomer = {
                profile: {
                    customerNo: '10010103'
                }
            };
            var ordersObj = orderHelpers.getOrders(currentCustomer);
            assert.equal(ordersObj.orders[0].sfccOrderNumber, '00001501@RefArch');
        });
    });

    describe('should get the empty arrays and log an error when a request has failed', function () {
        beforeEach(function () {
            logSpy = sinon.spy();
        });
        function createOrderHelpersWithFailedRequest() {
            return proxyquire('../../../../../../cartridges/plugin_ordermanagement/cartridge/scripts/order/orderHelpers', {

                'dw/web/Resource': {},
                'dw/web/URLUtils': {},
                'dw/catalog/ProductMgr': {},
                '*/cartridge/scripts/helpers/productHelpers': {},
                '*/cartridge/scripts/helpers/utilHelpers': {},
                '*/cartridge/models/product/decorators/index': {},
                '*/cartridge/scripts/som': {
                    getOrders: function () {
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
                    return null;
                },
                'dw/system/Logger': {
                    error: logSpy
                },
                '*/cartridge/config/somPreferences': {}
            });
        }
        it('should return and empty order array when a request has failed', function () {
            var orderHelpersWithFailedRequest = createOrderHelpersWithFailedRequest();

            var currentCustomer = {
                profile: {
                    customerNo: '10010103'
                }
            };
            var ordersObj = orderHelpersWithFailedRequest.getOrders(currentCustomer);
            assert.lengthOf(ordersObj.orders, 0);
        });
        it('should return and empty order array when a request has failed', function () {
            var orderHelpersWithFailedRequest = createOrderHelpersWithFailedRequest();

            var currentCustomer = {
                profile: {
                    customerNo: '10010103'
                }
            };
            var ordersObj = orderHelpersWithFailedRequest.getOrders(currentCustomer);
            assert.lengthOf(ordersObj.filterValues, 0);
        });
        it('should log an error when a request has failed', function () {
            var orderHelpersWithFailedRequest = createOrderHelpersWithFailedRequest();

            var currentCustomer = {
                profile: {
                    customerNo: '10010103'
                }
            };
            orderHelpersWithFailedRequest.getOrders(currentCustomer);
            assert.isTrue(logSpy.calledOnce);
        });
    });
});
