'use strict';

var preferences = require('*/cartridge/config/preferences');
var DEFAULT_MAX_ORDER_QUANTITY = preferences.maxOrderQty || 2;
var OTC_MAX_ORDER_QUANTITY = preferences.otcMaxOrderQty || 5;

module.exports = function (object, product, quantity) {
    Object.defineProperty(object, 'selectedQuantity', {
        enumerable: true,
        value: parseInt(quantity, 10) || (product && product.minOrderQuantity ? product.minOrderQuantity.value : 1)
    });
    Object.defineProperty(object, 'minOrderQuantity', {
        enumerable: true,
        value: product && product.minOrderQuantity ? product.minOrderQuantity.value : 1
    });
    Object.defineProperty(object, 'maxOrderQuantity', {
        enumerable: true,
        value: !product.custom.isOTCProduct ? DEFAULT_MAX_ORDER_QUANTITY : OTC_MAX_ORDER_QUANTITY
    });
};
