'use strict';

var base = module.superModule;

/**
 * Stores a new address for a given customer
 * @param {Object} address - New address to be saved
 * @param {Object} customer - Current customer
 * @param {string} addressId - Id of a new address to be created
 * @returns {void}
 */
base.saveAddress = function saveAddress(address, customer, addressId) {
    var Transaction = require('dw/system/Transaction');
    var addressBook;
    if (customer instanceof dw.customer.Customer) {
        addressBook = customer.getProfile().getAddressBook();
    } else {
        addressBook = customer.raw.getProfile().getAddressBook();
    }
    Transaction.wrap(function () {
        var customerAddress = addressBook.createAddress(addressId);
        if (customerAddress === null) {
            customerAddress = addressBook.getAddress(addressId);
        }
        base.updateAddressFields(customerAddress, address);
    });
};

module.exports = base;
