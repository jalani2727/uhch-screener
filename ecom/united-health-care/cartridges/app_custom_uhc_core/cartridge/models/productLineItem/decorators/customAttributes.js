'use strict';

module.exports = function (object, lineItem) {
    Object.defineProperty(object, 'earType', {
        enumerable: true,
        value: 'earType' in lineItem.custom && lineItem.custom.earType ? lineItem.custom.earType : ''
    });
};
