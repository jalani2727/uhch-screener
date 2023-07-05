'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var fulfillmentDetailsMock = {
    id: '12345',
    orderSummaryId: 'os123',
    fulfillmentStatus: 'Ordered',
    orderLineItems: [
        {
            orderItemSummaryId: 'somID000001',
            productCode: 'eComID0001',
            quantity: 2,
            totalPrice: 24.0
        },
        {
            orderItemSummaryId: 'somID000002',
            productCode: 'eComID0002',
            quantity: 1,
            totalPrice: 59.99
        }
    ]
};

var SomFulfillmentOrder = proxyquire('../../../../cartridges/plugin_ordermanagement/cartridge/models/somFulfillmentOrder', {
    '*/cartridge/models/somOrderItems': function () {
        return [];
    },
    '*/cartridge/config/somPreferences': {
        statusOrdered: 'Ordered',
        statusInProgress: 'InProgress',
        statusShipped: 'Shipped',
        statusReturned: 'Returned',
        statusCanceled: 'Canceled',
        statusFulfilled: 'Fulfilled'
    },
    'dw/web/Resource': {
        msg: function () {
            return 'some message';
        },
        msgf: function () {
            return 'some formatted message';
        }
    }
});

describe('somFulfillmentOrder Model', function () {
    it('should create the somFulfillmentOrder model with the "id" property that is equal to "12345"', function () {
        var somFulfillmentOrderModel = new SomFulfillmentOrder(fulfillmentDetailsMock);
        assert.equal(somFulfillmentOrderModel.id, fulfillmentDetailsMock.id);
    });

    it('should create the somFulfillmentOrder model with the "orderSummaryId" property that is equal to "12345"', function () {
        var somFulfillmentOrderModel = new SomFulfillmentOrder(fulfillmentDetailsMock);
        assert.equal(somFulfillmentOrderModel.orderSummaryId, fulfillmentDetailsMock.orderSummaryId);
    });

    it('should create the somFulfillmentOrder model with the "status" property that is equal to "Ordered"', function () {
        var somFulfillmentOrderModel = new SomFulfillmentOrder(fulfillmentDetailsMock);
        assert.equal(somFulfillmentOrderModel.status, fulfillmentDetailsMock.fulfillmentStatus);
    });

    it('should create the somFulfillmentOrder model with "orderItems" property that is not equal to null', function () {
        var somFulfillmentOrderModel = new SomFulfillmentOrder(fulfillmentDetailsMock);
        assert.isNotNull(somFulfillmentOrderModel.orderItems);
    });

    it('should create the somFulfillmentOrder model with "statusDisplayLabel" property that is not equal to "some message"', function () {
        var somFulfillmentOrderModel = new SomFulfillmentOrder(fulfillmentDetailsMock);
        assert.equal(somFulfillmentOrderModel.statusDisplayLabel, 'some message');
    });

    it('should create the somFulfillmentOrder model with the "a11yViewOrderDetailsText" property that is not equal to "some formatted message"', function () {
        var somFulfillmentOrderModel = new SomFulfillmentOrder(fulfillmentDetailsMock);
        assert.equal(somFulfillmentOrderModel.a11yViewOrderDetailsText, 'some formatted message');
    });

    it('should create the somFulfillmentOrder model with "status"  property that is  equal to "Ordered" by given a fulfillmentStatus to be equal to "Ordered"', function () {
        fulfillmentDetailsMock = {
            fulfillmentStatus: 'Ordered'
        };
        var somFulfillmentOrderModel = new SomFulfillmentOrder(fulfillmentDetailsMock);
        assert.equal(somFulfillmentOrderModel.status, 'Ordered');
    });

    it('should create the somFulfillmentOrder model with "status"  property that is  equal to "InProgress" by given a fulfillmentStatus to be equal to "InProgress"', function () {
        fulfillmentDetailsMock = {
            fulfillmentStatus: 'InProgress'
        };
        var somFulfillmentOrderModel = new SomFulfillmentOrder(fulfillmentDetailsMock);
        assert.equal(somFulfillmentOrderModel.status, 'InProgress');
    });

    it('should create the somFulfillmentOrder model with "status"  property that is  equal to "Shipped" by given a fulfillmentStatus to be equal to "Shipped"', function () {
        fulfillmentDetailsMock = {
            fulfillmentStatus: 'Shipped'
        };
        var somFulfillmentOrderModel = new SomFulfillmentOrder(fulfillmentDetailsMock);
        assert.equal(somFulfillmentOrderModel.status, 'Shipped');
    });

    it('should create the somFulfillmentOrder model with "status"  property that is  equal to "Canceled" by given a fulfillmentStatus to be equal to "Canceled"', function () {
        fulfillmentDetailsMock = {
            fulfillmentStatus: 'Canceled'
        };
        var somFulfillmentOrderModel = new SomFulfillmentOrder(fulfillmentDetailsMock);
        assert.equal(somFulfillmentOrderModel.status, 'Canceled');
    });

    it('should create the somFulfillmentOrder model with "status"  property that is  equal to "Returned" by given a fulfillmentStatus to be equal to "Returned"', function () {
        fulfillmentDetailsMock = {
            fulfillmentStatus: 'Returned'
        };
        var somFulfillmentOrderModel = new SomFulfillmentOrder(fulfillmentDetailsMock);
        assert.equal(somFulfillmentOrderModel.status, 'Returned');
    });

    it('should create the somFulfillmentOrder model with "status"  property that is  equal to "Fulfilled" by given a fulfillmentStatus to be equal to "Fulfilled"', function () {
        fulfillmentDetailsMock = {
            fulfillmentStatus: 'Fulfilled'
        };
        var somFulfillmentOrderModel = new SomFulfillmentOrder(fulfillmentDetailsMock);
        assert.equal(somFulfillmentOrderModel.status, 'Fulfilled');
    });

    it('should create the somFulfillmentOrder model with "orderSummaryId"  property that is equal to "null" by given a fulfillmentDetailsMock that is equal to "null"', function () {
        var somFulfillmentOrderModel = new SomFulfillmentOrder(null);
        assert.isNull(somFulfillmentOrderModel.orderSummaryId);
    });

    it('should create the somFulfillmentOrder model with "status"  property that is equal to "null" by given a fulfillmentDetailsMock that is equal to "-"', function () {
        var somFulfillmentOrderModel = new SomFulfillmentOrder(null);
        assert.equal(somFulfillmentOrderModel.status, '-');
    });

    it('should create the somFulfillmentOrder model with "orderItems"  property that is equal to "null" by given a fulfillmentDetailsMock that is equal to "null"', function () {
        var somFulfillmentOrderModel = new SomFulfillmentOrder(null);
        assert.isNull(somFulfillmentOrderModel.orderItems);
    });

    it('should create the somFulfillmentOrder model with "statusDisplayLabel"  property that is equal to "null" by given a fulfillmentDetailsMock that is equal to "empty string"', function () {
        var somFulfillmentOrderModel = new SomFulfillmentOrder(null);
        assert.equal(somFulfillmentOrderModel.statusDisplayLabel, '');
    });

    it('should create the somFulfillmentOrder model with "a11yViewOrderDetailsText"  property that is equal to "null" by given a fulfillmentDetailsMock that is equal to "empty string"', function () {
        var somFulfillmentOrderModel = new SomFulfillmentOrder(null);
        assert.equal(somFulfillmentOrderModel.a11yViewOrderDetailsText, '');
    });
});
