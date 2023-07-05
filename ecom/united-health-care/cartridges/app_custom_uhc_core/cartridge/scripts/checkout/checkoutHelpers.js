'use strict';

var base = module.superModule;
var Transaction = require('dw/system/Transaction');

/**
 * Copies information from the valid address returned from UPS service to the associated shipping address
 * @param {Object} shippingData - the shipping data of UPS service returned address
 * @param {dw.order.Shipment} shipment - the target Shipment
 */
base.copyUPSValidAddresstoShipment = function copyUPSValidAddresstoShipment(shippingData, shipment) {
    var BasketMgr = require('dw/order/BasketMgr');
    var currentBasket = BasketMgr.getCurrentBasket();
    var currentShipment = shipment || currentBasket.defaultShipment;
    var shippingAddress = currentShipment.shippingAddress;

    Transaction.wrap(function () {
        if (shippingAddress === null) {
            shippingAddress = shipment.createShippingAddress();
        }
        shippingAddress.setFirstName(shippingData.firstName);
        shippingAddress.setLastName(shippingData.lastName);
        shippingAddress.setAddress1(shippingData.address1);
        shippingAddress.setAddress2(shippingData.address2);
        shippingAddress.setCity(shippingData.city);
        shippingAddress.setPostalCode(shippingData.postalCode);
        shippingAddress.setStateCode(shippingData.state);
        shippingAddress.setCountryCode(shippingData.countryCode);
        shippingAddress.setPhone(shippingData.phone);
    });
};

/**
 * Compares information from the valid address returned from UPS service to the user
 * added shipping address and returns true only if all fields matches
 * @param {Object} shippingData - the user entered address
 * @param {Object} svcAddress - the UPS Service address object
 * @return {boolean} - true if all the fields are same with service returned address
 */
base.compareUPSAddress = function compareUPSAddresses(shippingData, svcAddress) {
    return ((shippingData.address1 === svcAddress.address1) &&
        (shippingData.city === svcAddress.city) &&
        (shippingData.postalCode === svcAddress.postalCode) &&
        (shippingData.stateCode === svcAddress.state) &&
        (shippingData.countryCode === svcAddress.countryCode));
};

/**
 * Copies shipping address 1 and address 2 in Shipment for the OMS
 * @param {Object} shipment - shipment
 * @param {Object} shippingAddress - shippingAddress
 */
base.copyAddressForOMS = function copyAddressForOMS(shipment, shippingAddress) {
    var currentShipment = shipment;
    Transaction.wrap(function () {
        currentShipment.custom.address1 = shippingAddress ? shippingAddress.address1 : '';
        currentShipment.custom.address2 = shippingAddress ? shippingAddress.address2 : '';
    });
};

module.exports = base;
