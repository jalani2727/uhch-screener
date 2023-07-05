'use strict';

var server = require('server');
server.extend(module.superModule);

/**
 * Handle Ajax shipping form submit
 */
/**
 * CheckoutShippingServices-SubmitShipping : The CheckoutShippingServices-SubmitShipping endpoint submits the shopper's shipping addresse(s) and shipping method(s) and saves them to the basket
 * @name Base/CheckoutShippingServices-SubmitShipping
 * @function
 * @memberof CheckoutShippingServices
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.validateAjaxRequest
 * @param {httpparameter} - shipmentUUID - The universally unique identifier of the shipment
 * @param {httpparameter} - dwfrm_shipping_shippingAddress_shippingMethodID - The selected shipping method id
 * @param {httpparameter} - shipmentSelector - For Guest shopper: A shipment UUID that contains address that matches the selected address, For returning shopper: ab_<address-name-from-address-book>" of the selected address. For both type of shoppers: "new" if a brand new address is entered
 * @param {httpparameter} - dwfrm_shipping_shippingAddress_addressFields_firstName - shipping address input field, shopper's shipping first name
 * @param {httpparameter} - dwfrm_shipping_shippingAddress_addressFields_lastName - shipping address input field, shopper's last name
 * @param {httpparameter} - dwfrm_shipping_shippingAddress_addressFields_address1 - shipping address input field, address line 1
 * @param {httpparameter} - dwfrm_shipping_shippingAddress_addressFields_address2 - shipping address nput field address line 2
 * @param {httpparameter} - dwfrm_shipping_shippingAddress_addressFields_country - shipping address input field, country
 * @param {httpparameter} - dwfrm_shipping_shippingAddress_addressFields_states_stateCode - shipping address input field, state code (Not all locales have state code)
 * @param {httpparameter} - dwfrm_shipping_shippingAddress_addressFields_city - shipping address input field, city
 * @param {httpparameter} - dwfrm_shipping_shippingAddress_addressFields_postalCode - shipping address input field, postal code (or zipcode)
 * @param {httpparameter} - dwfrm_shipping_shippingAddress_addressFields_phone - shipping address input field, shopper's phone number
 * @param {httpparameter} - dwfrm_shipping_shippingAddress_giftMessage - text area for gift message
 * @param {httpparameter} - csrf_token - Hidden input field CSRF token
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.append(
    'SubmitShipping',
    function (req, res, next) {
        var Resource = require('dw/web/Resource');
        var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
        var BasketMgr = require('dw/order/BasketMgr');
        var HookMgr = require('dw/system/HookMgr');
        var PaymentMgr = require('dw/order/PaymentMgr');
        var Transaction = require('dw/system/Transaction');
        var AccountModel = require('*/cartridge/models/account');
        var URLUtils = require('dw/web/URLUtils');
        var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
        var hooksHelper = require('*/cartridge/scripts/helpers/hooks');

        this.on('route:BeforeComplete', function () {
            var viewData = res.getViewData();
            if (!viewData.error && !viewData.showAddressValidForm) {
                var paymentMethodID = 'CREDIT_CARD';
                var processor = PaymentMgr.getPaymentMethod(paymentMethodID).getPaymentProcessor();
                if (!processor) {
                    throw new Error(Resource.msg(
                        'error.payment.processor.missing',
                        'checkout',
                        null
                    ));
                }

                var currentBasket = BasketMgr.getCurrentBasket();

                var billingData = res.getViewData();

                var result;

                // if there is no selected payment option and balance is greater than zero
                if (!paymentMethodID && currentBasket.totalGrossPrice.value > 0) {
                    var noPaymentMethod = {};

                    noPaymentMethod[billingData.paymentMethod.htmlName] =
                        Resource.msg('error.no.selected.payment.method', 'payment', null);

                    delete billingData.paymentInformation;

                    res.json({
                        // form: billingForm,
                        fieldErrors: [noPaymentMethod],
                        serverErrors: [],
                        error: true
                    });
                    return;
                }

                // check to make sure there is a payment processor
                if (HookMgr.hasHook('app.payment.processor.' + processor.ID.toLowerCase())) {
                    result = HookMgr.callHook('app.payment.processor.' + processor.ID.toLowerCase(),
                        'Handle',
                        currentBasket,
                        billingData.paymentInformation,
                        paymentMethodID,
                        req
                    );
                } else {
                    result = HookMgr.callHook('app.payment.processor.default', 'Handle');
                }

                // need to invalidate credit card fields
                if (result.error) {
                    delete billingData.paymentInformation;

                    res.json({
                        fieldErrors: result.fieldErrors,
                        serverErrors: result.serverErrors,
                        error: true
                    });
                    return;
                }

                // Calculate the basket
                Transaction.wrap(function () {
                    basketCalculationHelpers.calculateTotals(currentBasket);
                });

                // Re-calculate the payments.
                var calculatedPaymentTransaction = COHelpers.calculatePaymentTransaction(
                    currentBasket
                );

                if (calculatedPaymentTransaction.error) {
                    res.json({
                        fieldErrors: [],
                        serverErrors: [Resource.msg('error.technical', 'checkout', null)],
                        error: true
                    });
                    return;
                }

                var accountModel = new AccountModel(req.currentCustomer);
                // eslint-disable-next-line no-unused-vars
                var renderedStoredPaymentInstrument = COHelpers.getRenderedPaymentInstruments(
                    req,
                    accountModel
                );

                delete billingData.paymentInformation;

                // order creation flow start
                if (req.session.privacyCache.get('fraudDetectionStatus')) {
                    res.json({
                        error: true,
                        cartError: true,
                        redirectUrl: URLUtils.url('Error-ErrorCode', 'err', '01').toString(),
                        errorMessage: Resource.msg('error.technical', 'checkout', null)
                    });

                    return;
                }

                var validationOrderStatus = hooksHelper('app.validate.order', 'validateOrder', currentBasket, require('*/cartridge/scripts/hooks/validateOrder').validateOrder);
                if (validationOrderStatus.error) {
                    res.json({
                        error: true,
                        errorMessage: validationOrderStatus.message
                    });
                    return;
                }

                // Check to make sure there is a shipping address
                if (currentBasket.defaultShipment.shippingAddress === null) {
                    res.json({
                        error: true,
                        errorStage: {
                            stage: 'shipping',
                            step: 'address'
                        },
                        errorMessage: Resource.msg('error.no.shipping.address', 'checkout', null)
                    });
                    return;
                }

                // Check to make sure billing address exists
                if (!currentBasket.billingAddress) {
                    res.json({
                        error: true,
                        errorStage: {
                            stage: 'payment',
                            step: 'billingAddress'
                        },
                        errorMessage: Resource.msg('error.no.billing.address', 'checkout', null)
                    });
                    return;
                }

                // Re-validates existing payment instruments
                var validPayment = COHelpers.validatePayment(req, currentBasket);
                if (validPayment.error) {
                    res.json({
                        error: true,
                        errorStage: {
                            stage: 'payment',
                            step: 'paymentInstrument'
                        },
                        errorMessage: Resource.msg('error.payment.not.valid', 'checkout', null)
                    });
                    return;
                }

                // Re-calculate the payments.
                var calculatedPaymentTransactionTotal = COHelpers.calculatePaymentTransaction(currentBasket);
                if (calculatedPaymentTransactionTotal.error) {
                    res.json({
                        error: true,
                        errorMessage: Resource.msg('error.technical', 'checkout', null)
                    });
                    return;
                }

                // Creates a new order.
                var order = COHelpers.createOrder(currentBasket);
                if (!order) {
                    res.json({
                        error: true,
                        errorMessage: Resource.msg('error.technical', 'checkout', null)
                    });
                    return;
                }
                session.custom.currentOrderNo = order.orderNo;
                COHelpers.updateCustomerDataToOrder(order);

                var servicehelper = require('*/cartridge/scripts/helpers/upgServiceHelper');
                var iframeURL = servicehelper.getIframeUrl(order);

                billingData.iframeUrl = iframeURL;
                billingData.createdOrder = order;
                res.setViewData(billingData);
            }
        });
        return next();
    }
);

/**
 * CheckoutShippingServices-UpdateValidAddress :
 * The CheckoutShippingServices-UpdateValidAddress endpoint
 * validates the shopper's shipping addresse(s) and saves them to the basket and place the
 * order with the updated address
 * @name Base/CheckoutShippingServices-UpdateValidAddress
 * @function
 * @memberof UpdateValidAddress
 */
server.append(
    'UpdateValidAddress',
    function (req, res, next) {
        var Resource = require('dw/web/Resource');
        var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
        var BasketMgr = require('dw/order/BasketMgr');
        var HookMgr = require('dw/system/HookMgr');
        var PaymentMgr = require('dw/order/PaymentMgr');
        var Transaction = require('dw/system/Transaction');
        var AccountModel = require('*/cartridge/models/account');
        var URLUtils = require('dw/web/URLUtils');
        var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
        var hooksHelper = require('*/cartridge/scripts/helpers/hooks');

        this.on('route:BeforeComplete', function () {
            var paymentMethodID = 'CREDIT_CARD';
            var processor = PaymentMgr.getPaymentMethod(paymentMethodID).getPaymentProcessor();
            if (!processor) {
                throw new Error(Resource.msg(
                    'error.payment.processor.missing',
                    'checkout',
                    null
                ));
            }

            var currentBasket = BasketMgr.getCurrentBasket();
            var billingData = res.getViewData();
            var result;
            // if there is no selected payment option and balance is greater than zero
            if (!paymentMethodID && currentBasket.totalGrossPrice.value > 0) {
                var noPaymentMethod = {};

                noPaymentMethod[billingData.paymentMethod.htmlName] =
                    Resource.msg('error.no.selected.payment.method', 'payment', null);

                delete billingData.paymentInformation;

                res.json({
                    // form: billingForm,
                    fieldErrors: [noPaymentMethod],
                    serverErrors: [],
                    error: true
                });
                return;
            }

            // check to make sure there is a payment processor
            if (HookMgr.hasHook('app.payment.processor.' + processor.ID.toLowerCase())) {
                result = HookMgr.callHook('app.payment.processor.' + processor.ID.toLowerCase(),
                    'Handle',
                    currentBasket,
                    billingData.paymentInformation,
                    paymentMethodID,
                    req
                );
            } else {
                result = HookMgr.callHook('app.payment.processor.default', 'Handle');
            }

            // need to invalidate credit card fields
            if (result.error) {
                delete billingData.paymentInformation;

                res.json({
                    fieldErrors: result.fieldErrors,
                    serverErrors: result.serverErrors,
                    error: true
                });
                return;
            }

            // Calculate the basket
            Transaction.wrap(function () {
                basketCalculationHelpers.calculateTotals(currentBasket);
            });

            // Re-calculate the payments.
            var calculatedPaymentTransaction = COHelpers.calculatePaymentTransaction(
                currentBasket
            );

            if (calculatedPaymentTransaction.error) {
                res.json({
                    fieldErrors: [],
                    serverErrors: [Resource.msg('error.technical', 'checkout', null)],
                    error: true
                });
                return;
            }

            var accountModel = new AccountModel(req.currentCustomer);
            // eslint-disable-next-line no-unused-vars
            var renderedStoredPaymentInstrument = COHelpers.getRenderedPaymentInstruments(
                req,
                accountModel
            );

            delete billingData.paymentInformation;

            // order creation flow start
            if (req.session.privacyCache.get('fraudDetectionStatus')) {
                res.json({
                    error: true,
                    cartError: true,
                    redirectUrl: URLUtils.url('Error-ErrorCode', 'err', '01').toString(),
                    errorMessage: Resource.msg('error.technical', 'checkout', null)
                });

                return;
            }

            var validationOrderStatus = hooksHelper('app.validate.order', 'validateOrder', currentBasket, require('*/cartridge/scripts/hooks/validateOrder').validateOrder);
            if (validationOrderStatus.error) {
                res.json({
                    error: true,
                    errorMessage: validationOrderStatus.message
                });
                return;
            }

            // Check to make sure there is a shipping address
            if (currentBasket.defaultShipment.shippingAddress === null) {
                res.json({
                    error: true,
                    errorStage: {
                        stage: 'shipping',
                        step: 'address'
                    },
                    errorMessage: Resource.msg('error.no.shipping.address', 'checkout', null)
                });
                return;
            }

            // Check to make sure billing address exists
            if (!currentBasket.billingAddress) {
                res.json({
                    error: true,
                    errorStage: {
                        stage: 'payment',
                        step: 'billingAddress'
                    },
                    errorMessage: Resource.msg('error.no.billing.address', 'checkout', null)
                });
                return;
            }

            // Re-validates existing payment instruments
            var validPayment = COHelpers.validatePayment(req, currentBasket);
            if (validPayment.error) {
                res.json({
                    error: true,
                    errorStage: {
                        stage: 'payment',
                        step: 'paymentInstrument'
                    },
                    errorMessage: Resource.msg('error.payment.not.valid', 'checkout', null)
                });
                return;
            }

            // Re-calculate the payments.
            var calculatedPaymentTransactionTotal = COHelpers.calculatePaymentTransaction(currentBasket);
            if (calculatedPaymentTransactionTotal.error) {
                res.json({
                    error: true,
                    errorMessage: Resource.msg('error.technical', 'checkout', null)
                });
                return;
            }

            // Creates a new order.
            var order = COHelpers.createOrder(currentBasket);
            if (!order) {
                res.json({
                    error: true,
                    errorMessage: Resource.msg('error.technical', 'checkout', null)
                });
                return;
            }
            session.custom.currentOrderNo = order.orderNo;
            COHelpers.updateCustomerDataToOrder(order);

            var servicehelper = require('*/cartridge/scripts/helpers/upgServiceHelper');
            var iframeURL = servicehelper.getIframeUrl(order);

            billingData.iframeUrl = iframeURL;
            billingData.createdOrder = order;
            res.setViewData(billingData);
        });
        return next();
    }
);

module.exports = server.exports();
