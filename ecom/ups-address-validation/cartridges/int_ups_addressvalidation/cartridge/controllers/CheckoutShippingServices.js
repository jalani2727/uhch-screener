'use strict';

/**
 * @namespace CheckoutShippingServices
 */

var server = require('server');
server.extend(module.superModule);

/**
 * Handle Ajax shipping form submit
 */
/**
 * CheckoutShippingServices-SubmitShipping : The CheckoutShippingServices-SubmitShipping endpoint
 * submits the shopper's shipping addresse(s) and shipping method(s) and saves them to the basket
 * @name Base/CheckoutShippingServices-SubmitShipping
 * @function
 * @memberof CheckoutShippingServices
 */
server.append('SubmitShipping', function (req, res, next) {
    var Site = require('dw/system/Site');
    var URLUtils = require('dw/web/URLUtils');
    var adressValidationSvc = require('*/cartridge/scripts/services/UPSAddressValidationService');
    var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
    var BasketMgr = require('dw/order/BasketMgr');
    var currentBasket = BasketMgr.getCurrentBasket();
    var viewData = res.getViewData();
    var shippingAddress = viewData.address;

    COHelpers.copyAddressForOMS(currentBasket.defaultShipment, shippingAddress);
    var isAddressValidationEnabled = Site.getCurrent().getCustomPreferenceValue('upsaddressValidationEnabled');
    if (!viewData.error && isAddressValidationEnabled) {
            // Make a call to Address Validation and Update Basket if valid address is returned
        var svcResponse = adressValidationSvc.call(shippingAddress);
        if (svcResponse.ok) {
            var object = svcResponse.object;
            if (object.valid) {
                    // If address is valid comparing the entered address with returned address
                var isSameAddress = COHelpers.compareUPSAddress(object.address, shippingAddress);
                if (!isSameAddress) {
                    res.json({
                        showAddressValidForm: true,
                        suggestedAddress: object.address ? JSON.stringify(object.address) : null,
                        validAddress: true,
                        updateAddressURL: URLUtils.https('CheckoutShippingServices-UpdateValidAddress').toString()
                    });
                    this.emit('route:Complete', req, res);
                    return null;
                }
                        // If address is valid copying the returned address to basket
                COHelpers.copyUPSValidAddresstoShipment(
                            object.address,
                            currentBasket.defaultShipment);
            } else {
                    // Send error as true as we need to show suggested address valid modal
                res.json({
                    showAddressValidForm: true,
                    suggestedAddress: object.address ? JSON.stringify(object.address) : null,
                    validAddress: false,
                    updateAddressURL: URLUtils.https('CheckoutShippingServices-UpdateValidAddress').toString()
                });
                this.emit('route:Complete', req, res);
                return null;
            }
        }
    }

    return next();
});

/**
 * Updates the address to basket from UPS Address Validation Model
 */
/**
 * CheckoutShippingServices-UpdateValidAddress :
 * The CheckoutShippingServices-UpdateValidAddress endpoint
 * validates the shopper's shipping addresse(s) and saves them to the basket
 * @name Base/CheckoutShippingServices-UpdateValidAddress
 * @function
 * @memberof UpdateValidAddress
 */
server.post('UpdateValidAddress', server.middleware.https, function (req, res, next) {
    var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
    var BasketMgr = require('dw/order/BasketMgr');
    var Logger = require('dw/system/Logger');
    var currentBasket = BasketMgr.getCurrentBasket();
    var OrderModel = require('*/cartridge/models/order');
    var Locale = require('dw/util/Locale');
    var AccountModel = require('*/cartridge/models/account');

    try {
        var data = req.form.data; // Data selected in the validation Modal
        var addressSelected = data ? data.split(',') : null;
        var addressEntered = server.forms.getForm('shipping');
        var addressObject = {};
        var isSuggestedSelected = req.form.isSuggested;

        // Forming an address object required to update basket with new selected address
        addressObject.firstName = addressEntered.shippingAddress.addressFields.firstName.value;
        addressObject.lastName = addressEntered.shippingAddress.addressFields.lastName.value;
        addressObject.phone = addressEntered.shippingAddress.addressFields.phone.value;

        if (isSuggestedSelected === 'true' && addressSelected) {
            addressObject.address1 = addressSelected ? addressSelected[0].trim() : addressEntered.shippingAddress.addressFields.address1.value;
            addressObject.address2 = addressSelected.length > 5 ? addressSelected[1].trim() : '';
            addressObject.city = addressSelected.length > 5 ? addressSelected[2].trim() : addressSelected[1].trim();
            addressObject.postalCode = addressSelected.length > 5 ? addressSelected[4].trim() : addressSelected[3].trim();
            addressObject.state = addressSelected.length > 5 ? addressSelected[3].trim() : addressSelected[2].trim();
            addressObject.countryCode = addressSelected.length > 5 ? addressSelected[5].trim() : addressSelected[4].trim();
        } else {
            addressObject.address1 = addressEntered.shippingAddress.addressFields.address1.value;
            addressObject.address2 = addressEntered.shippingAddress.addressFields.address2.value;
            addressObject.city = addressEntered.shippingAddress.addressFields.city.value;
            addressObject.postalCode = addressEntered.shippingAddress.addressFields.postalCode.value;
            addressObject.state = addressEntered.shippingAddress.addressFields.states.stateCode.value;
            addressObject.countryCode = addressEntered.shippingAddress.addressFields.country.value;
        }

        // This method updates the shipping address to the validated address or continues with normal address
        COHelpers.copyUPSValidAddresstoShipment(addressObject, currentBasket.defaultShipment);
        // After updating shipping updating the same to billing address
        COHelpers.copyBillingAddressToBasket(currentBasket.defaultShipment.shippingAddress, currentBasket);
        var currentLocale = Locale.getLocale(req.locale.id);
        // Updating the basket model as well as we are updating shipping and billling address
        var basketModel = new OrderModel(
            currentBasket,
            {
                usingMultiShipping: false,
                shippable: true,
                countryCode: currentLocale.country,
                containerView: 'basket'
            }
        );
        res.json({
            success: true,
            customer: new AccountModel(req.currentCustomer),
            order: basketModel,
            form: server.forms.getForm('shipping')
        });
    } catch (e) {
        Logger.error('Error while updating shipping and billing adddress ' + e);
        res.json({
            error: true
        });
    }
    return next();
});

module.exports = server.exports();
