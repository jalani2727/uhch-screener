'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var productMock = {
    ID: 'eComID0001',
    quantity: 2,
    price: 2,
    custom: {
        nonRMA: true
    }
};

var orderItem = {
    ID: 'eComID0001',
    quantity: 2,
    price: 2,
    custom: {
        nonRMA: true
    }
};

describe('orderHelpers.addProductData', function () {
    describe('get product information from eCom', function () {
        var orderHelpers = proxyquire('../../../../../../cartridges/plugin_ordermanagement/cartridge/scripts/order/orderHelpers', {
            'dw/web/Resource': {},
            'dw/web/URLUtils': {},
            'dw/catalog/ProductMgr': {
                getProduct: function () {
                    return productMock;
                }
            },
            '*/cartridge/scripts/helpers/productHelpers': {
                getVariationModel: function () {
                    return {
                        getSelectedVariant: function () {
                            return productMock;
                        }
                    };
                },
                getProductType: function () {
                    return 'variant';
                }
            },
            '*/cartridge/scripts/helpers/utilHelpers': {
                formatMoney: function (amount) {
                    return '$' + amount;
                }
            },
            '*/cartridge/models/product/decorators/index': {
                base: function (product) {
                    Object.defineProperty(product, 'productName', {
                        enumerable: true,
                        value: 'product name A'
                    });
                },
                images: function (product) {
                    Object.defineProperty(product, 'images', {
                        enumerable: true,
                        value: 'product A image'
                    });
                },
                variationAttributes: function (product, apiProduct) {
                    if (apiProduct) {
                        Object.defineProperty(product, 'variationAttributes', {
                            enumerable: true,
                            value: 'product A variationAttributes'
                        });
                    }
                }
            },
            '*/cartridge/scripts/som': {},
            '*/cartridge/scripts/helpers/somHelpers': {},
            '*/cartridge/models/somOrder': {},
            'dw/system/Logger': {},
            '*/cartridge/config/somPreferences': {
                nonRMAProductCustomAttribute: 'nonRMA'
            }
        });
        beforeEach(function () {
            orderHelpers.addProductData(orderItem, 'USD');
        });
        it('should return an order with "productName" property to be equal to "product name A"', function () {
            assert.equal(orderItem.productName, 'product name A');
        });
        it('should return an order with "images" property to be equal to "product A image"', function () {
            assert.equal(orderItem.images, 'product A image');
        });
        it('should return an order with "variationAttributes" property to be equal to "product A variationAttributes"', function () {
            assert.equal(orderItem.variationAttributes, 'product A variationAttributes');
        });
        it('should return an order with "cost" property to be equal to "4"', function () {
            assert.equal(orderItem.cost, 4);
        });
        it('should return an order with "cost" property to be equal to "$4"', function () {
            assert.equal(orderItem.totalPrice, '$4');
        });
        it('should return an order with "cost" property to be equal to "false"', function () {
            assert.equal(orderItem.nonRMA, false);
        });
    });
});
