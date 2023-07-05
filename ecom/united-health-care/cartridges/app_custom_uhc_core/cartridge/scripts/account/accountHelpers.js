var base = module.superModule;

base.getAccountModel = function getAccountModel(req) {
    var AccountModel = require('*/cartridge/models/account');
    var AddressModel = require('*/cartridge/models/address');
    var orderHelpers = require('*/cartridge/scripts/order/orderHelpers');

    var preferredAddressModel;
    var orderModel;

    if (!req.currentCustomer.profile) {
        return null;
    }
    var orderHistory = req.currentCustomer.raw.getOrderHistory();
    if (orderHistory.orderCount > 0) {
        orderModel = orderHelpers.getLastOrder(req);
    } else {
        orderModel = null;
    }

    if (req.currentCustomer.addressBook.preferredAddress) {
        preferredAddressModel = new AddressModel(req.currentCustomer.addressBook.preferredAddress);
    } else {
        preferredAddressModel = null;
    }

    return new AccountModel(req.currentCustomer, preferredAddressModel, orderModel);
};
module.exports = base;
