'use strict';

var ATTRIBUTE_NAME = 'color';
var collections = require('*/cartridge/scripts/util/collections');
var ImageModel = require('*/cartridge/models/product/productImages');
var URLUtils = require('dw/web/URLUtils');

module.exports = function (object, hit) {
    Object.defineProperty(object, 'variationAttributes', {
        enumerable: true,
        value: (function () {
            var colors = hit.getRepresentedVariationValues(ATTRIBUTE_NAME);

            return [{
                attributeId: 'color',
                id: 'color',
                swatchable: true,
                values: collections.map(colors, function (color) {
                    var apiImage = new ImageModel(color, {
                        types: ['swatch'],
                        quantity: 'single'
                    });
                    if (!apiImage) {
                        return {};
                    }
                    return {
                        id: color.ID,
                        description: color.description,
                        displayValue: color.displayValue,
                        value: color.value,
                        selectable: true,
                        selected: true,
                        images: {
                            swatch: [{
                                alt: apiImage.swatch[0].alt,
                                url: apiImage.swatch[0].url,
                                title: apiImage.swatch[0].title
                            }]
                        },
                        url: URLUtils.url(
                            'Product-Show',
                            'pid',
                            hit.productID,
                            'dwvar_' + hit.productID + '_color',
                            color.value
                        ).toString()
                    };
                })
            }];
        }())
    });
};
