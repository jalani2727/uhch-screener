'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var SomPayment = proxyquire('../../../../cartridges/plugin_ordermanagement/cartridge/models/somPayment', {});
var ORDER_ID = 'orderId';
var PAYMENT_METHOD_ID = 'paymentMethodId';

var somApiOrderPaymentMapMock = {
    '_orderId': {
        '_paymentMethodId': {
            'attributes': {
                'type': 'CardPaymentMethod',
                'url': '/services/data/v51.0/sobjects/CardPaymentMethod/paymentMethodId'
            },
            'Id': 'paymentMethodId',
            'DisplayCardNumber': '************1111',
            'CardHolderName': 'Test Test',
            'ExpiryMonth': 12,
            'ExpiryYear': 2023,
            'CardCategory': 'CreditCard',
            'CardType': 'Visa',
            'CardTypeCategory': 'Visa'
        }
    }
};

describe('somPayment Model', function () {
    it('The property "DisplayCardNumber" of the somPayment model should be equal to the "DisplayCardNumber" property of the somApiOrderPaymentMapMock', function () {
        var somPaymentModel = new SomPayment(somApiOrderPaymentMapMock, ORDER_ID, PAYMENT_METHOD_ID);
        // eslint-disable-next-line no-underscore-dangle
        assert.strictEqual(somPaymentModel.DisplayCardNumber, somApiOrderPaymentMapMock._orderId._paymentMethodId.DisplayCardNumber);
    });

    it('The property "CardHolderName" of the somPayment model should be equal to the "CardHolderName" property of the somApiOrderPaymentMapMock', function () {
        var somPaymentModel = new SomPayment(somApiOrderPaymentMapMock, ORDER_ID, PAYMENT_METHOD_ID);
        // eslint-disable-next-line no-underscore-dangle
        assert.strictEqual(somPaymentModel.CardHolderName, somApiOrderPaymentMapMock._orderId._paymentMethodId.CardHolderName);
    });

    it('The property "ExpiryMonth" of the somPayment model should be equal to the "ExpiryMonth" number received of the somApiOrderPaymentMapMock', function () {
        var somPaymentModel = new SomPayment(somApiOrderPaymentMapMock, ORDER_ID, PAYMENT_METHOD_ID);
        // eslint-disable-next-line no-underscore-dangle
        assert.strictEqual(somPaymentModel.ExpiryMonth, somApiOrderPaymentMapMock._orderId._paymentMethodId.ExpiryMonth);
    });

    it('The property "ExpiryYear" of the somPayment model should be equal to the "ExpiryYear" number received of the somApiOrderPaymentMapMock', function () {
        var somPaymentModel = new SomPayment(somApiOrderPaymentMapMock, ORDER_ID, PAYMENT_METHOD_ID);
        // eslint-disable-next-line no-underscore-dangle
        assert.strictEqual(somPaymentModel.ExpiryYear, somApiOrderPaymentMapMock._orderId._paymentMethodId.ExpiryYear);
    });

    it('The property "CardCategory" of the somPayment model should be equal to the "CardCategory" number received of the somApiOrderPaymentMapMock', function () {
        var somPaymentModel = new SomPayment(somApiOrderPaymentMapMock, ORDER_ID, PAYMENT_METHOD_ID);
        // eslint-disable-next-line no-underscore-dangle
        assert.strictEqual(somPaymentModel.CardCategory, somApiOrderPaymentMapMock._orderId._paymentMethodId.CardCategory);
    });

    it('The property "CardType" of the somPayment model should be equal to the "CardType" number received of the somApiOrderPaymentMapMock', function () {
        var somPaymentModel = new SomPayment(somApiOrderPaymentMapMock, ORDER_ID, PAYMENT_METHOD_ID);
        // eslint-disable-next-line no-underscore-dangle
        assert.strictEqual(somPaymentModel.CardType, somApiOrderPaymentMapMock._orderId._paymentMethodId.CardType);
    });

    it('The property "CardTypeCategory" of the somPayment model should be equal to the "CardTypeCategory" number received of the somApiOrderPaymentMapMock', function () {
        var somPaymentModel = new SomPayment(somApiOrderPaymentMapMock, ORDER_ID, PAYMENT_METHOD_ID);
        // eslint-disable-next-line no-underscore-dangle
        assert.strictEqual(somPaymentModel.CardTypeCategory, somApiOrderPaymentMapMock._orderId._paymentMethodId.CardTypeCategory);
    });
});
