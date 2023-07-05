var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('utilHelpers', function () {
    var utilHelpers = proxyquire('../../../../../cartridges/plugin_ordermanagement/cartridge/scripts/helpers/utilHelpers', {
        'dw/value/Money': function (amount) {
            return {
                amount: amount,
                multiply: function () {
                    return {
                        value: '38.97'
                    };
                }
            };
        },
        'dw/util/StringUtils': {
            formatMoney: function (amount) {
                return '$' + amount.amount;
            }
        },
        'dw/util/Calendar': function () {
            return {
                set: function () {
                },
                getTime: function () {
                    return 'Date Object';
                }
            };
        },
        'dw/web/URLUtils': function () {
            return {
                url: function () {
                    return '';
                }
            };
        }
    });

    describe('formatMoney', function () {
        it('should format the money value on the currency code', function () {
            var formattedAmount = utilHelpers.formatMoney('15.99');
            assert.equal(formattedAmount, '$15.99');
        });
    });

    describe('calculateTotalPrice', function () {
        it('should calculate total price for the quantity with correct format for the currency code', function () {
            var totalAmount = utilHelpers.calculateTotalPrice('12.99', '3', 'USD');
            assert.equal(totalAmount, '38.97');
        });
        it('should throw an error when currency is undefined', function () {
            assert.throws(function () {
                // eslint-disable-next-line no-unused-vars
                var totalAmount = utilHelpers.calculateTotalPrice('12.99', '3', undefined);
            }, 'currency code is not specified');
        });
    });

    describe('convertDateStringToDateObject', function () {
        it('should convert date String to Date Object', function () {
            var dateObj = utilHelpers.convertDateStringToDateObject('2020-06-18T20:42:34.000+0000');
            assert.equal(dateObj, 'Date Object');
        });
    });
});
