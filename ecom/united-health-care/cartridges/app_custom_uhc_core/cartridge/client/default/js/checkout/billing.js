'use strict';

var base = require('base/checkout/billing');

/**
 * Validate and update payment instrument form fields
 */
function validateAndUpdateBillingPaymentInstrument() {
    // no need to this function
    /* var billing = order.billing;
    if (!billing.payment || !billing.payment.selectedPaymentInstruments
        || billing.payment.selectedPaymentInstruments.length <= 0) return;

    var form = $('form[name=dwfrm_billing]');
    if (!form) return;

    var instrument = billing.payment.selectedPaymentInstruments[0];
    $('select[name$=expirationMonth]', form).val(instrument.expirationMonth);
    $('select[name$=expirationYear]', form).val(instrument.expirationYear);
    // Force security code and card number clear
    $('input[name$=securityCode]', form).val('');
    $('input[name$=cardNumber]').data('cleave').setRawValue(''); */
}

/**
 * handle credit card is not required
 */
function handleCreditCardNumber() {
    // no action required
}

/**
 * remove Decline Card Message from the payment page
 */
function removeDeclineCardMessage() {
    if ($('.upg-payment-decline-message').length > 0) {
        setTimeout(function () {
            $('.upg-payment-decline-message').remove();
        }, 5000);
    }
}

module.exports = base;
base.methods.validateAndUpdateBillingPaymentInstrument = validateAndUpdateBillingPaymentInstrument;
base.handleCreditCardNumber = handleCreditCardNumber;
base.removeDeclineCardMessage = removeDeclineCardMessage;
