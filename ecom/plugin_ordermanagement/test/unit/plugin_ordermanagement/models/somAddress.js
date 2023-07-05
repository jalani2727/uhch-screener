'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var SomAddress = proxyquire('../../../../cartridges/plugin_ordermanagement/cartridge/models/somAddress', {});

var Address = {
    city: 'Carlyle',
    country: 'US',
    geocodeAccuracy: null,
    latitude: null,
    longitude: null,
    postalCode: '62231-1729',
    state: 'IL',
    street: '1890 Franklin Avenue'
};

var Account = {
    attributes: { 'type': 'Account', 'url': '/services/data/v51.0/sobjects/Account/001B000001MTjsAIAT' },
    FirstName: 'Test',
    LastName: 'Test',
    PersonEmail: 'test@gmail.com',
    BillingAddress: {
        'city': 'Carlyle',
        'country': 'US',
        'geocodeAccuracy': null,
        'latitude': null,
        'longitude': null,
        'postalCode': '62231-1729',
        'state': 'IL',
        'street': '1890 Franklin Avenue'
    },
    BillingCity: 'Carlyle',
    BillingCountry: 'US',
    BillingPostalCode: '62231-1729',
    BillingState: 'IL',
    BillingStreet: '1890 Franklin Avenue',
    Phone: '1234512345'
};

describe('somAddress Model', function () {
    it('The somAddressModel should not be null', function () {
        var somAddressModel = new SomAddress(Address, Account);
        assert.isNotNull(somAddressModel);
    });

    it('The "firstName" property of the somAddress model should be equal to the FirstName property provided by the Account object', function () {
        var somAddressModel = new SomAddress(Address, Account);
        assert.strictEqual(somAddressModel.firstName, Account.FirstName);
    });

    it('The "lastName" property of the somAddress model should be equal to the LastName property provided by the Account object', function () {
        var somAddressModel = new SomAddress(Address, Account);
        assert.strictEqual(somAddressModel.lastName, Account.LastName);
    });

    it('The "phone" property of the somAddress model should be equal to the Phone property provided by the Account object', function () {
        var somAddressModel = new SomAddress(Address, Account);
        assert.strictEqual(somAddressModel.phone, Account.Phone);
    });

    it('The "email" property of the somAddress model should be equal to the "PersonEmail" property provided by the Account object', function () {
        var somAddressModel = new SomAddress(Address, Account);
        assert.strictEqual(somAddressModel.email, Account.PersonEmail);
    });

    it('The "street" property of the somAddress model should be equal to the "street" property provided by the Address object', function () {
        var somAddressModel = new SomAddress(Address, Account);
        assert.strictEqual(somAddressModel.street, Address.street);
    });

    it('The "city" property of the somAddress model should be equal to the "city" property provided by the Address object', function () {
        var somAddressModel = new SomAddress(Address, Account);
        assert.strictEqual(somAddressModel.city, Address.city);
    });

    it('The "state" property of the somAddress model should be equal to the "state" property provided by the Address object', function () {
        var somAddressModel = new SomAddress(Address, Account);
        assert.strictEqual(somAddressModel.postalCode, Address.postalCode);
    });

    it('The "postalCode" property of the somAddress model should be equal to the "postalCode" property provided by the Address object', function () {
        var somAddressModel = new SomAddress(Address, Account);
        assert.strictEqual(somAddressModel.postalCode, Address.postalCode);
    });

    it('The "firstName" of the somAddress model should be equal to "-"', function () {
        var somAddressModel = new SomAddress(Address, null);
        assert.strictEqual(somAddressModel.firstName, '-');
    });

    it('The "lastName" of the somAddress model should be equal to "-"', function () {
        var somAddressModel = new SomAddress(Address, null);
        assert.strictEqual(somAddressModel.lastName, '-');
    });

    it('The "phone" of the somAddress model should be equal to "-"', function () {
        var somAddressModel = new SomAddress(Address, null);
        assert.strictEqual(somAddressModel.phone, '-');
    });

    it('The "email" of the somAddress model should be equal to "-', function () {
        var somAddressModel = new SomAddress(Address, null);
        assert.strictEqual(somAddressModel.email, '-');
    });
});
