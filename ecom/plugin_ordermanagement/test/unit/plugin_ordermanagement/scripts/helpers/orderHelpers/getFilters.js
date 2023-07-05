'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');
// eslint-disable-next-line no-unused-vars
var logSpy;

describe('orderHelpers.getFilters', function () {
    beforeEach(function () {
        logSpy = sinon.spy();
    });

    var magicDateNumbers = {
        days: 86400000,
        weeks: 604800000,
        months: 2678400000,
        years: 31556952000
    };

    var orderHelpers = proxyquire('../../../../../../cartridges/plugin_ordermanagement/cartridge/scripts/order/orderHelpers', {
        'dw/web/Resource': {},
        'dw/web/URLUtils': {},
        'dw/catalog/ProductMgr': {},
        '*/cartridge/scripts/helpers/productHelpers': {},
        '*/cartridge/scripts/helpers/utilHelpers': {},
        '*/cartridge/models/product/decorators/index': {},
        '*/cartridge/scripts/som': {
            getLastOrder: function (customerNo) {
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

                var somApiResponseMock2 = {
                    ok: true,
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

                if (customerNo === '10010101') {
                    return somApiResponseMock;
                } else if (customerNo === 'error') {
                    return { ok: false };
                }

                return somApiResponseMock2;
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
            return {};
        },
        'dw/value/Money': function () {
            return {};
        },
        'dw/system/Logger': {},
        '*/cartridge/config/somPreferences': {
            filterUnits: {
                days: magicDateNumbers.days,
                weeks: magicDateNumbers.weeks,
                months: magicDateNumbers.months,
                years: magicDateNumbers.years
            },
            filters: [
                {
                    displayValue: 'last 30 days',
                    optionValue: 'urlVlaue',
                    units: magicDateNumbers.days,
                    filterName: 'days',
                    multiplier: 30
                },
                {
                    displayValue: 'last 60 days',
                    optionValue: 'urlVlaue',
                    units: magicDateNumbers.days,
                    filterName: 'days',
                    multiplier: 60
                },
                {
                    displayValue: '2019',
                    optionValue: 'urlVlaue',
                    units: 0,
                    filterName: 'year',
                    multiplier: 2019
                },
                {
                    displayValue: 'all',
                    optionValue: 'urlVlaue',
                    units: 0,
                    filterName: 'all',
                    multiplier: 0
                }
            ]
        }
    });

    function getDateFromQueryString(unitValue, multiplier) {
        var offsetValue = unitValue * multiplier;
        var today = new Date();
        var newDate = Date.parse(today) - offsetValue;
        var offsetDate = new Date(newDate);
        var day = offsetDate.getDate();
        var month = offsetDate.getMonth();
        return '' + offsetDate.getFullYear() + '-' + (month < 10 ? '0' : '') + (month + 1) + '-' + (day < 10 ? '0' : '') + day + 'T00:00:00.000Z';
    }

    it('should return {} if null is passed in', function () {
        var filters = orderHelpers.getFilters(null);
        assert.equal(Object.keys(filters).length, Object.keys({}).length);
    });

    it('should return filter for given year (2019)', function () {
        var queryString = {
            filterYear: 2019,
            filterUnit: 'year'
        };
        var filters = orderHelpers.getFilters(queryString);
        assert.equal(filters.year, queryString.filterYear);
    });

    it('should return date used to get orders from som given 30 days option', function () {
        var queryString = {
            filterValue: 30,
            filterUnit: 'days'
        };
        var dateStr = getDateFromQueryString(magicDateNumbers.days, queryString.filterValue);
        var filters = orderHelpers.getFilters(queryString);
        assert.equal(filters.fromDate, dateStr);
    });

    it('should return date used to get orders from som given 1 week option', function () {
        var queryString = {
            filterValue: 1,
            filterUnit: 'weeks'
        };
        var dateStr = getDateFromQueryString(magicDateNumbers.weeks, queryString.filterValue);
        var filters = orderHelpers.getFilters(queryString);
        assert.equal(filters.fromDate, dateStr);
    });

    it('should return date used to get orders from som given 1 month option', function () {
        var queryString = {
            filterValue: 1,
            filterUnit: 'months'
        };

        var dateStr = getDateFromQueryString(magicDateNumbers.months, queryString.filterValue);
        var filters = orderHelpers.getFilters(queryString);
        assert.equal(filters.fromDate, dateStr);
    });

    it('should default to all orders if the units are mispelled by returning an {}', function () {
        var queryString = {
            filterValue: 1,
            filterUnit: 'monthss'
        };

        var filters = orderHelpers.getFilters(queryString);
        assert.equal(Object.keys(filters).length, Object.keys({}).length);
    });

    it('should return date used to get orders from som given 1 year option', function () {
        var queryString = {
            filterValue: 1,
            filterUnit: 'years'
        };
        var dateStr = getDateFromQueryString(magicDateNumbers.years, queryString.filterValue);
        var filters = orderHelpers.getFilters(queryString);
        assert.equal(filters.fromDate, dateStr);
    });
});
