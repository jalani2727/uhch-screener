'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var SOM_BILLING_FILE_PATH = '../../../../cartridges/plugin_ordermanagement/cartridge/models/somBilling';

function createSomApiOrderSummaryMock() {
    return {
        Id: 'orderId',
        Account: {
            FirstName: 'DefaultFirstName',
            LastName: 'DefaultLastName',
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
            }
        },
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
        BillingPhoneNumber: 1234512345,
        BillingEmailAddress: 'test@gmail.com',
        OrderPaymentSummaries: {
            totalSize: 1,
            done: true,
            records: [{
                'attributes': {}, PaymentMethodId: 'paymentMethodId', FullName: 'Test Test', Method: 'Visa - 1111'
            }]
        }
    };
}

var somApiOrderPaymentMapMock = {
    '_orderId': {
        '_paymentMethodId': {
            'Id': 'paymentMethodId',
            'DisplayCardNumber': '************1111',
            'CardHolderName': 'FirstNameCardHolder LastNameCardHolder',
            'ExpiryMonth': 12,
            'ExpiryYear': 2023,
            'CardCategory': 'CreditCard',
            'CardType': 'Visa',
            'CardTypeCategory': 'Visa'
        }
    }
};

var somApiOrderPaymentMapWithoutCardHolderMock = {
    '_orderId': {
        '_paymentMethodId': {
            'Id': 'paymentMethodId',
            'DisplayCardNumber': '************1111',
            'CardHolderName': '-',
            'ExpiryMonth': 12,
            'ExpiryYear': 2023,
            'CardCategory': 'CreditCard',
            'CardType': 'Visa',
            'CardTypeCategory': 'Visa'
        }
    }
};

function createSomBillingModel() {
    return proxyquire(SOM_BILLING_FILE_PATH, {
        // eslint-disable-next-line global-require
        '*/cartridge/models/somAddress': require('../../../../cartridges/plugin_ordermanagement/cartridge/models/somAddress'),
        // eslint-disable-next-line global-require
        '*/cartridge/models/somPayment': require('../../../../cartridges/plugin_ordermanagement/cartridge/models/somPayment')
    });
}

describe('somBilling Model', function () {
    it('should create the somBilling model with "address" property that is not equal to null', function () {
        var SomBilling = createSomBillingModel();
        var somApiOrderSummaryMock = createSomApiOrderSummaryMock();
        var somBillingModel = new SomBilling(somApiOrderSummaryMock, somApiOrderPaymentMapMock);
        assert.isNotNull(somBillingModel.address);
    });
    it('should create the somBilling model with "payment" property that is not equal to null', function () {
        var SomBilling = createSomBillingModel();
        var somApiOrderSummaryMock = createSomApiOrderSummaryMock();
        var somBillingModel = new SomBilling(somApiOrderSummaryMock, somApiOrderPaymentMapMock);
        assert.isNotNull(somBillingModel.payment);
    });

    it('should create the somBilling model with "address.firstName" property that is equal to a cardholder first name', function () {
        var SomBilling = createSomBillingModel();
        var somApiOrderSummaryMock = createSomApiOrderSummaryMock();
        var somBillingModel = new SomBilling(somApiOrderSummaryMock, somApiOrderPaymentMapMock);
        assert.equal(somBillingModel.address.firstName, 'FirstNameCardHolder');
    });

    it('should create the somBilling model with "address.lastName" property that is equal to a cardholder last name', function () {
        var SomBilling = createSomBillingModel();
        var somApiOrderSummaryMock = createSomApiOrderSummaryMock();
        var somBillingModel = new SomBilling(somApiOrderSummaryMock, somApiOrderPaymentMapMock);
        assert.equal(somBillingModel.address.lastName, 'LastNameCardHolder');
    });

    it('should create the somBilling model with "address.firstName" that is equal to "DefaultFirstName" value if "this.payment.CardHolderName" is equal to "-"', function () {
        var SomBilling = createSomBillingModel();
        var somApiOrderSummaryMock = createSomApiOrderSummaryMock();
        var somBillingModel = new SomBilling(somApiOrderSummaryMock, somApiOrderPaymentMapWithoutCardHolderMock);
        assert.equal(somBillingModel.address.firstName, 'DefaultFirstName');
    });

    it('should create the somBilling model with "address.lastName" that is equal to "DefaultLastName" value if "this.payment.CardHolderName" is equal to "-"', function () {
        var SomBilling = createSomBillingModel();
        var somApiOrderSummaryMock = createSomApiOrderSummaryMock();
        var somBillingModel = new SomBilling(somApiOrderSummaryMock, somApiOrderPaymentMapWithoutCardHolderMock);
        assert.equal(somBillingModel.address.lastName, 'DefaultLastName');
    });
});
