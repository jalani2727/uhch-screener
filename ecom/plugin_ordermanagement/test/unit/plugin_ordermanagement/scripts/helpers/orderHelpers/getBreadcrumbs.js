'use strict';
var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var orderHelpers = proxyquire('../../../../../../cartridges/plugin_ordermanagement/cartridge/scripts/order/orderHelpers', {
    'dw/web/Resource': {
        msg: function (message) {
            return message;
        }
    },
    'dw/web/URLUtils': {
        home: function () {
            return 'home';
        },
        https: function (action, orderFilter) {
            if (orderFilter) {
                return action + '/' + orderFilter;
            }
            return action;
        }
    },
    'dw/catalog/ProductMgr': {},
    '*/cartridge/scripts/helpers/productHelpers': {},
    '*/cartridge/scripts/helpers/utilHelpers': {},
    '*/cartridge/models/product/decorators/index': {},
    '*/cartridge/scripts/som': {},
    '*/cartridge/scripts/helpers/somHelpers': {},
    '*/cartridge/models/somOrder': {},
    'dw/system/Logger': {},
    '*/cartridge/config/somPreferences': {}
});

var req = {
    querystring: {
        orderFilter: 'someFilter'
    }
};

describe('orderHelpers.getBreadcrumbs', function () {
    it('should return an array with two objects that have properties: {htmlValue: "global.home", url: "home"}, {htmlValue: "heading.order.page", url: "Login-Show"}', function () {
        var result = orderHelpers.getBreadcrumbs('', false, {});
        assert.sameDeepMembers([{ htmlValue: 'global.home', url: 'home' }, {
            htmlValue: 'heading.order.page',
            url: 'Login-Show'
        }], result);
    });

    it('should return an array with two objects that have properties: {htmlValue: "global.home", url: "home"}, {htmlValue: "page.title.myaccount", url: "Account-Show"}', function () {
        var result = orderHelpers.getBreadcrumbs('', true, {});
        assert.sameDeepMembers([{ htmlValue: 'global.home', url: 'home' }, {
            htmlValue: 'page.title.myaccount',
            url: 'Account-Show'
        }], result);
    });

    it('should return an array with 3 objects that have properties: {htmlValue: "global.home", url: "home"}, {htmlValue: "heading.order.page", url: "Login-Show"}, {htmlValue: "label.orderhistory", url: "Order-GuestDetails"}', function () {
        var result = orderHelpers.getBreadcrumbs('Cancel', false, {});
        assert.sameDeepMembers([
            { htmlValue: 'global.home', url: 'home' },
            { htmlValue: 'heading.order.page', url: 'Login-Show' },
            { htmlValue: 'label.orderhistory', url: 'Order-GuestDetails' }
        ], result);
    });

    it('should return an array with 3 objects that have properties: {htmlValue: "global.home", url: "home"}, {htmlValue: "heading.order.page", url: "Login-Show"}, {htmlValue: "label.orderhistory", url: "Order-History/orderFilter"}', function () {
        var result = orderHelpers.getBreadcrumbs('Cancel', true, req);
        assert.sameDeepMembers([
            { htmlValue: 'global.home', url: 'home' },
            { htmlValue: 'page.title.myaccount', url: 'Account-Show' },
            { htmlValue: 'label.orderhistory', url: 'Order-History/orderFilter' }
        ], result);
    });

    it('should return an array with 3 objects when request object does not contain "orderFilter" property that have properties: {htmlValue: "global.home", url: "home"}, {htmlValue: "heading.order.page", url: "Login-Show"}, {htmlValue: "label.orderhistory", url: "Order-History"}', function () {
        var reqWithoutFilter = {
            querystring: {}
        };
        var result = orderHelpers.getBreadcrumbs('Cancel', true, reqWithoutFilter);
        assert.sameDeepMembers([
            { htmlValue: 'global.home', url: 'home' },
            { htmlValue: 'page.title.myaccount', url: 'Account-Show' },
            { htmlValue: 'label.orderhistory', url: 'Order-History' }
        ], result);
    });
});
