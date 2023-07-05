'use strict';

var base = module.superModule;

var PaymentInstrument = require('dw/order/PaymentInstrument');
var PaymentMgr = require('dw/order/PaymentMgr');
var OrderMgr = require('dw/order/OrderMgr');
var Transaction = require('dw/system/Transaction');
var HookMgr = require('dw/system/HookMgr');

/**
 * Validates payment
 * @param {Object} req - The local instance of the request object
 * @param {dw.order.Basket} currentBasket - The current basket
 * @returns {Object} an object that has error information
 */
base.validatePayment = function validatePayment(req, currentBasket) {
    // eslint-disable-next-line no-unused-vars
    var applicablePaymentCards;
    var applicablePaymentMethods;
    var creditCardPaymentMethod = PaymentMgr.getPaymentMethod(PaymentInstrument.METHOD_CREDIT_CARD);
    var paymentAmount = currentBasket.totalGrossPrice.value;
    var countryCode = req.geolocation.countryCode;
    var currentCustomer = req.currentCustomer.raw;
    var paymentInstruments = currentBasket.paymentInstruments;
    var result = {};

    applicablePaymentMethods = PaymentMgr.getApplicablePaymentMethods(
        currentCustomer,
        countryCode,
        paymentAmount
    );
    applicablePaymentCards = creditCardPaymentMethod.getApplicablePaymentCards(
        currentCustomer,
        countryCode,
        paymentAmount
    );

    var invalid = true;

    for (var i = 0; i < paymentInstruments.length; i++) {
        var paymentInstrument = paymentInstruments[i];

        if (PaymentInstrument.METHOD_GIFT_CERTIFICATE.equals(paymentInstrument.paymentMethod)) {
            invalid = false;
        }

        var paymentMethod = PaymentMgr.getPaymentMethod(paymentInstrument.getPaymentMethod());

        if (paymentMethod && applicablePaymentMethods.contains(paymentMethod)) {
            if (PaymentInstrument.METHOD_CREDIT_CARD.equals(paymentInstrument.paymentMethod)) {
                // Checks whether payment card is still applicable.
                // commenting now as we are using iframe for payment
                /* var card = PaymentMgr.getPaymentCard(paymentInstrument.creditCardType);
                if (card && applicablePaymentCards.contains(card)) {
                    invalid = false;
                } */
                invalid = false;
            } else {
                invalid = false;
            }
        }

        if (invalid) {
            break; // there is an invalid payment instrument
        }
    }

    result.error = invalid;
    return result;
};

/**
 * handles the payment authorization for each payment instrument
 * @param {dw.order.Order} order - the order object
 * @param {string} orderNumber - The order number for the order
 * @param {Object} transactionDetails - transactionDetails
 * @returns {Object} an error object
 */
base.handlePayments = function handlePayments(order, orderNumber, transactionDetails) {
    var result = {};

    if (order.totalNetPrice !== 0.00) {
        var paymentInstruments = order.paymentInstruments;

        if (paymentInstruments.length === 0) {
            Transaction.wrap(function () { OrderMgr.failOrder(order, true); });
            result.error = true;
        }

        if (!result.error) {
            for (var i = 0; i < paymentInstruments.length; i++) {
                var paymentInstrument = paymentInstruments[i];
                var paymentProcessor = PaymentMgr
                    .getPaymentMethod(paymentInstrument.paymentMethod)
                    .paymentProcessor;
                var authorizationResult;
                if (paymentProcessor === null) {
                    Transaction.begin();
                    paymentInstrument.paymentTransaction.setTransactionID(orderNumber);
                    Transaction.commit();
                } else {
                    if (HookMgr.hasHook('app.payment.processor.' +
                            paymentProcessor.ID.toLowerCase())) {
                        authorizationResult = HookMgr.callHook(
                            'app.payment.processor.' + paymentProcessor.ID.toLowerCase(),
                            'Authorize',
                            orderNumber,
                            paymentInstrument,
                            paymentProcessor,
                            transactionDetails
                        );
                    } else {
                        authorizationResult = HookMgr.callHook(
                            'app.payment.processor.default',
                            'Authorize'
                        );
                    }

                    if (authorizationResult.error) {
                        Transaction.wrap(function () { OrderMgr.failOrder(order, true); });
                        result.error = true;
                        break;
                    }
                }
            }
        }
    }

    return result;
};

/**
 * Attempts to place the order
 * @param {dw.order.Order} order - The order object to be placed
 * @returns {Object} an error object
 */
base.placeOrder = function placeOrder(order) {
    var Status = require('dw/system/Status');
    var Order = require('dw/order/Order');
    var Resource = require('dw/web/Resource');

    var result = { error: false };

    try {
        Transaction.begin();
        var placeOrderStatus = OrderMgr.placeOrder(order);
        if (placeOrderStatus === Status.ERROR) {
            throw new Error();
        }
        // eslint-disable-next-line no-param-reassign
        order.custom.customPaymentStatus = Resource.msg('upgcredit.completed', 'checkout', null);
        order.setConfirmationStatus(Order.CONFIRMATION_STATUS_CONFIRMED);
        order.setExportStatus(Order.EXPORT_STATUS_READY);
        Transaction.commit();
    } catch (e) {
        Transaction.wrap(function () { OrderMgr.failOrder(order, true); });
        result.error = true;
    }

    return result;
};

/**
 * update customer data in the order object and then
 * those to the OMS
 * @param {dw.order.Order} order - The order object
 */
base.updateCustomerDataToOrder = function placeOrder(order) {
    var Resource = require('dw/web/Resource');
    var preferences = require('*/cartridge/config/preferences.js');
    var defaultAppID = preferences.defaultAppID;
    Transaction.wrap(function () {
        order.custom.customPaymentStatus = Resource.msg('upgcredit.inprocess', 'checkout', null);
        order.custom.sfdcContactID = (customer.profile && customer.profile.custom.sfdcContactID) || '';
        order.custom.pricebookID = session.privacy.pricebook || '';
        order.custom.opportunityID = session.privacy.customerDetails && JSON.parse(session.privacy.customerDetails).Opportunity_Id && JSON.parse(session.privacy.customerDetails).Opportunity_Id !== null ? JSON.parse(session.privacy.customerDetails).Opportunity_Id : '';
        order.custom.subscriberID = session.privacy.subscriberId || '';
        order.custom.appID = !empty(session.custom.appID) ? session.custom.appID : defaultAppID;
        if (session.privacy.eligibilityTimeout){
            order.custom.eligibilityTimeout = true;
        } else {
            order.custom.eligibilityTimeout = false;
        }
    });
};

/**
 * Adding UPG find API response to the order note
 * @param {dw.order.Order} order - The order object
 * @param {Object} transactionDetail - transactionDetail
 */
base.addOrderNotes = function addOrderNotes(order, transactionDetail) {
    Transaction.wrap(function () {
        if (transactionDetail.providerResponseMessage) {
            order.addNote(transactionDetail.providerResponseMessage.split('=')[0], transactionDetail.providerResponseMessage.split('=')[1]);
        }
        if (transactionDetail.responseMessage) {
            order.addNote(transactionDetail.responseMessage.split('=')[0], transactionDetail.responseMessage.split('=')[1]);
        }
    });
};

module.exports = base;
