'use strict';

var DefaultPrice = require('*/cartridge/models/price/default');

module.exports = function (object, apiProduct) {
    Object.defineProperty(object, 'customerPrice', {
        enumerable: true,
        value: (function () {
            if (session.privacy.pricebook && session.privacy.pricebook !== null) {
                var pricebookID = session.privacy.pricebook;
                var customerPrice = apiProduct.getPriceModel().getPriceBookPrice(pricebookID).available ? apiProduct.getPriceModel().getPriceBookPrice(pricebookID) : '';
                return customerPrice !== '' ? new DefaultPrice(customerPrice, null) : '';
            }
            return '';
        }())
    });
};
