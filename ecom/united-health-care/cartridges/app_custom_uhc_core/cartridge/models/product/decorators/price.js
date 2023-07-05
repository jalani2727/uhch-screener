'use strict';

var base = module.superModule;


module.exports = function (object, product, promotions, useSimplePrice, currentOptions) {
    base.call(this, object, product, promotions, useSimplePrice, currentOptions);
    Object.defineProperty(object, 'isPriceAvailable', {
        enumerable: true,
        value: object.price.sales && object.price.sales.value
    });
};
