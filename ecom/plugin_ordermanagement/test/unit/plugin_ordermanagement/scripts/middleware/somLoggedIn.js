var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');

var validateMethodLoggedInSpy;
var nextFunctionSpy;


describe('somLoggedIn.validateGuestOrUserLoggedIn', function () {
    beforeEach(function () {
        validateMethodLoggedInSpy = sinon.spy();
        nextFunctionSpy = sinon.spy();
    });


    it('should call next() function', function () {
        var reqMock = {
            session: {
                privacyCache: {
                    get: function (param) {
                        if (param === 'orderId') {
                            return 'someOrderId';
                        }
                        if (param === 'orderToken') {
                            return 'someOrderToken';
                        }

                        return false;
                    }
                }
            }
        };
        var middleware = proxyquire('../../../../../cartridges/plugin_ordermanagement/cartridge/scripts/middleware/somLoggedIn', {
            'dw/order/OrderMgr': {
                getOrder: function () {
                    return [{}, {}];
                }
            },
            '*/cartridge/scripts/middleware/userLoggedIn': {
                validateLoggedIn: validateMethodLoggedInSpy
            }
        });


        middleware.validateGuestOrUserLoggedIn(reqMock, {}, nextFunctionSpy);
        assert.isTrue(nextFunctionSpy.calledOnce);
    });

    it('should call validateLoggedIn() function', function () {
        var reqMock = {
            session: {
                privacyCache: {
                    get: function () {
                        return false;
                    }
                }
            }
        };

        var middleware = proxyquire('../../../../../cartridges/plugin_ordermanagement/cartridge/scripts/middleware/somLoggedIn', {
            'dw/order/OrderMgr': {
                getOrder: function () {
                    return [];
                }
            },
            '*/cartridge/scripts/middleware/userLoggedIn': {
                validateLoggedIn: validateMethodLoggedInSpy
            }
        });

        middleware.validateGuestOrUserLoggedIn(reqMock, {}, nextFunctionSpy);
        assert.isTrue(validateMethodLoggedInSpy.calledOnce);
    });
});
