'use strict';
var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var SomTotals = proxyquire('../../../../cartridges/plugin_ordermanagement/cartridge/models/somTotals', {
    '*/cartridge/scripts/helpers/utilHelpers': {
        formatMoney: function (amount) {
            return '$' + amount;
        }
    }
});

var somApiOrderSummaryMock = {
    GrandTotalAmount: '29.99',
    TotalAdjustedProductAmount: '25.50',
    OrderItemSummaries: {
        records: [
            { Quantity: '1' },
            { Quantity: '2' }
        ]
    }
};

describe('somTotals Model', function () {
    it('should create the somTotals model with the "grandTotal" property that is equal to "$29.99"', function () {
        var somTotalsModel = new SomTotals(somApiOrderSummaryMock);
        assert.equal(somTotalsModel.grandTotal, '$29.99');
    });

    it('should create the somTotals model with the "subTotal" property that is equal to "$25.50"', function () {
        var somTotalsModel = new SomTotals(somApiOrderSummaryMock);
        assert.equal(somTotalsModel.subTotal, '$25.50');
    });

    it('should create the somTotals model with the "totalQuantity" property that is equal to "3"', function () {
        var somTotalsModel = new SomTotals(somApiOrderSummaryMock);
        assert.equal(somTotalsModel.totalQuantity, 3);
    });

    it('should create the somTotals model by passing an argument with a type "Null" with the "grandTotal" property that is equal to "-"', function () {
        var somTotalsModel = new SomTotals(null);
        assert.equal(somTotalsModel.grandTotal, '-');
    });

    it('should create the somTotals model by passing an argument with a type "Null" with the "subTotal" property that is equal to "-"', function () {
        var somTotalsModel = new SomTotals(null);
        assert.equal(somTotalsModel.subTotal, '-');
    });

    it('should create the somTotals model by passing an argument with a type "Null" with the "totalQuantity" property that is equal to "0"', function () {
        var somTotalsModel = new SomTotals(null);
        assert.equal(somTotalsModel.totalQuantity, 0);
    });
});
