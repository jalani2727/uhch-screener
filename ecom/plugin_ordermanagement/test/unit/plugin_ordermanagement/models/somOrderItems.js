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

var orderItemsMock = [
    {
        orderItemSummaryId: 'somID000001',
        currencyCode: 'USD',
        sfccProductId: 'eComID0001',
        fulfillmentOrderLineItemId: '0a4B0000000TOsyIAG',
        quantity: 1,
        quantityAvailableToCancel: 0,
        quantityAvailableToFulfill: 0,
        quantityAvailableToReturn: 0,
        quantityOrdered: 1,
        quantityCanceled: 0,
        quantityReturned: 0,
        totalPrice: '$99.00',
        price: 99,
        productName: 'Some product name',
        variationAttributes: [
            {
                displayName: 'Color',
                displayValue: 'Black',
                attributeId: 'color',
                id: 'color'
            },
            {
                displayName: 'Size',
                displayValue: '4',
                attributeId: 'size',
                id: 'size'
            }
        ],
        images: {
            small: [
                {
                    alt: 'Platinum V Neck Suit Dress, Black, small',
                    url: 'url to image',
                    title: 'Platinum V Neck Suit Dress, Black',
                    index: '0',
                    absURL: 'absolute url to image'
                }
            ]
        },
        cost: 99,
        nonRMA: true
    }
];


var SomOrderItems = proxyquire('../../../../cartridges/plugin_ordermanagement/cartridge/models/somOrderItems', {
    '*/cartridge/scripts/order/orderHelpers':
        proxyquire('../../../../cartridges/plugin_ordermanagement/cartridge/scripts/order/orderHelpers', {
            'dw/web/Resource': {},
            'dw/web/URLUtils': {},
            'dw/catalog/ProductMgr': {
                getProduct: function () {
                    return null;
                }
            },
            '*/cartridge/scripts/helpers/productHelpers': {
                getVariationModel: function () {
                    return {
                        getSelectedVariant: function () {
                            return productMock;
                        }
                    };
                }
            },
            '*/cartridge/scripts/helpers/utilHelpers': {},
            '*/cartridge/models/product/decorators/index': {
                base: function () {
                },
                images: function () {
                },
                variationAttributes: function () {
                }
            },
            '*/cartridge/scripts/som': {},
            '*/cartridge/scripts/helpers/somHelpers': {},
            '*/cartridge/models/somOrder': {},
            'dw/system/Logger': {},
            '*/cartridge/config/somPreferences': {
                nonRMAProductCustomAttribute: 'nonRMA'
            }
        })
});

describe('somOrderItems Model', function () {
    it('should create the somOrderItems model object with the "orderItems" property of length "1"', function () {
        var somOrderItemsModel = new SomOrderItems(orderItemsMock);
        assert.equal(somOrderItemsModel.orderItems.length, 1);
    });

    it('should create the somOrderItems model object with the "orderItemSummaryId" to be equal "somID000001"', function () {
        var somOrderItemsModel = new SomOrderItems(orderItemsMock);
        assert.equal(somOrderItemsModel.orderItems[0].orderItemSummaryId, 'somID000001');
    });

    it('should create the somOrderItems model object with the "sfccProductId" to be equal "eComID0001"', function () {
        var somOrderItemsModel = new SomOrderItems(orderItemsMock);
        assert.equal(somOrderItemsModel.orderItems[0].sfccProductId, 'eComID0001');
    });

    it('should create the somOrderItems model object with the "quantity" to be equal "1"', function () {
        var somOrderItemsModel = new SomOrderItems(orderItemsMock);
        assert.equal(somOrderItemsModel.orderItems[0].quantity, 1);
    });

    it('should create the somOrderItems model object with the "totalPrice" to be equal "$99.00"', function () {
        var somOrderItemsModel = new SomOrderItems(orderItemsMock);
        assert.equal(somOrderItemsModel.orderItems[0].totalPrice, '$99.00');
    });

    it('should create the somOrderItems model object with the "productName" to be equal "Some product name"', function () {
        var somOrderItemsModel = new SomOrderItems(orderItemsMock);
        assert.equal(somOrderItemsModel.orderItems[0].productName, 'Some product name');
    });

    it('should create the somOrderItems model object with the "orderItems" property of length "0" when the argument passed is null', function () {
        var somOrderItemsModel = new SomOrderItems(null);
        assert.equal(somOrderItemsModel.orderItems.length, 0);
    });
});
