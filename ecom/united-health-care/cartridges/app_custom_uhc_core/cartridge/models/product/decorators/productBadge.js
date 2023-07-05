'use strict';

module.exports = function (object, apiProduct) {
    Object.defineProperty(object, 'productBadge', {
        enumerable: true,
        value: apiProduct && 'productBadge' in apiProduct.custom ? apiProduct.custom.productBadge : 'None'
    });
};
