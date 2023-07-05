'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var somApiOrderSummaryMock = {
    'Id': '1OsB0000000Uy3AKAS',
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
    },
    'DeliveryMethod': {
        'Id': '2DmB00000000CanKAE',
        'Name': 'Standard Ground',
        'Description': 'Ground shipping',
        'ProductId': '01tB00000019warIAA',
        'ReferenceNumber': '001'
    }
};
var addressModelMock = {
    firstName: '-',
    lastName: '-',
    phone: '-',
    email: '-',
    street: '1890 Franklin Avenue',
    city: 'Carlyle',
    state: 'IL',
    postalCode: '62231-1729'
};
var SomShipping = proxyquire('../../../../cartridges/plugin_ordermanagement/cartridge/models/somShipping', {
    // eslint-disable-next-line global-require
    '*/cartridge/models/somAddress': require('../../../../cartridges/plugin_ordermanagement/cartridge/models/somAddress')
});

describe('somTotals Model', function () {
    it('should create the SomShipping model object with "deliveryMethodName" property to be equal to "Standard Ground"', function () {
        var somShippingModel = new SomShipping(somApiOrderSummaryMock);
        assert.strictEqual(somShippingModel.deliveryMethodName, 'Standard Ground');
    });

    it('should create the SomShipping model object with "deliveryMethodDescription" property to be equal to "Ground shipping"', function () {
        var somShippingModel = new SomShipping(somApiOrderSummaryMock);
        assert.strictEqual(somShippingModel.deliveryMethodDescription, 'Ground shipping');
    });

    it('should create the SomShipping model object with "deliverToName" property to be equal to "Test Test"', function () {
        var somShippingModel = new SomShipping(somApiOrderSummaryMock);
        assert.strictEqual(somShippingModel.deliverToName, 'Test Test');
    });

    it('should create the SomShipping model object with "deliverToAddress" property to be equal to "addressModelMock" test object', function () {
        var somShippingModel = new SomShipping(somApiOrderSummaryMock);
        assert.deepEqual(somShippingModel.deliverToAddress, addressModelMock);
    });
});
