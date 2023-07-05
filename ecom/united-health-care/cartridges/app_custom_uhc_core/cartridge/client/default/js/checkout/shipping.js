/* eslint-disable vars-on-top */
/* eslint-disable no-undef */
'use strict';
// Changes done for UPS Address Validation Added function getShippingAddressValidator() to get modal for address validation.

var base = require('base/checkout/shipping');
var formHelpers = require('base/checkout/formErrors');
var scrollAnimate = require('base/components/scrollAnimate');

/**
 * Handle response from the server for valid or invalid form fields.
 * @param {Object} defer - the deferred object which will resolve on success or reject.
 * @param {Object} data - the response data with the invalid form fields or
 *  valid model data.
 */
function shippingFormResponse(defer, data) {
    var isMultiShip = $('#checkout-main').hasClass('multi-ship');
    var formSelector = isMultiShip
        ? '.multi-shipping .active form'
        : '.single-shipping form';

    // highlight fields with errors
    if (data.error) {
        if (data.fieldErrors && data.fieldErrors.length) {
            data.fieldErrors.forEach(function (error) {
                if (Object.keys(error).length) {
                    formHelpers.loadFormErrors(formSelector, error);
                }
            });
            defer.reject(data);
        }

        if (data.serverErrors && data.serverErrors.length) {
            $.each(data.serverErrors, function (index, element) {
                base.methods.createErrorNotification(element);
            });

            defer.reject(data);
        }

        if (data.cartError) {
            window.location.href = data.redirectUrl;
            defer.reject();
        }
    } else {
        // Populate the Address Summary

        $('body').trigger('checkout:updateCheckoutView', {
            order: data.order,
            customer: data.customer
        });
        scrollAnimate($('.payment-form'));
        defer.resolve(data);
    }
}

/**
 * getShippingAddressValidator
 * @param {Object} data - data
 * @param {Object} defer - defer
 */
function getShippingAddressValidator(data, defer) {
    var emptyString = '';
    var firstName = (data && data.address && data.address.firstName ? data.address.firstName : emptyString);
    var lastName = (data && data.address && data.address.lastName ? data.address.lastName : emptyString);
    var htmlString;
    var enteredAddress = data.address;
    var suggestedAddressString;
    var suggestedAddressFormatted;
    if (data.suggestedAddress) {
        var suggestedAddress = JSON.parse(data.suggestedAddress);
        if (suggestedAddress.address2) {
            suggestedAddressString = suggestedAddress.address1 + ', ' + suggestedAddress.address2;
            suggestedAddressFormatted = firstName + ' ' + lastName + '<br>' + suggestedAddress.address1 + '<br>' + suggestedAddress.address2;
        } else {
            suggestedAddressString = suggestedAddress.address1;
            suggestedAddressFormatted = firstName + ' ' + lastName + '<br>' + suggestedAddress.address1;
        }
        suggestedAddressString += ', ' + suggestedAddress.city + ', ' + suggestedAddress.state + ', ' + suggestedAddress.postalCode + ', ' + suggestedAddress.countryCode;
        suggestedAddressFormatted += '<br>' + suggestedAddress.city + '<br>' + suggestedAddress.state + ' ' + suggestedAddress.postalCode + ' ' + suggestedAddress.countryCode;
    }
    var enteredAddressString;
    if (enteredAddress.address2) {
        enteredAddressString = enteredAddress.address1 + ', ' + enteredAddress.address2;
    } else {
        enteredAddressString = enteredAddress.address1;
    }
    enteredAddressString += ', ' + enteredAddress.city + ', ' + enteredAddress.stateCode + ', ' + enteredAddress.postalCode + ', ' + enteredAddress.countryCode;
    var updateAddressURL = data.updateAddressURL;

    if (data.validAddress) {
        htmlString = '<!-- Modal -->' +
            '<div class="modal fade address-recommendation" id="chooseValidAddressModal" tabindex="-1" role="dialog">' +
            '<span class="enter-message sr-only" ></span>' +
            '<div class="modal-dialog" ' +
            '<!-- Modal content-->' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            ' <div class="modal-title" id="chooseValidAddressModal">We have found possible matches. An accurate address will help your order arrive on time.</div>' +
            '</div>' +
            '<div class="modal-body">' +
            '<div class="sub-heading">' +
            '<label class="radio-inline">' +
            'Please select the best match below:' +
            '</label>' +
            '</div>' +
            '<div>' +
            '<table>' +
               '<tr>' +
                    '<td>' +
                    '<input type="radio" name="inlineRadioOptions" id="inlineRadio1" value="' + suggestedAddressString + '" checked="checked" data-issuggested=true>' +
                    '</td>' +
                    '<td>' +
                    suggestedAddressString +
                    '</td>' +
                '</tr>' +
            '</table>' +
            '</div>' +
            '<div  class="divider-label">' +
            'or' +
            '</div>' +
            '<div class="sub-heading">' +
            '<label class="radio-inline">' +
            'Use the address as you entered below:' +
            '</label>' +
            '</div>' +
            '<div>' +
            '<table>' +
               '<tr>' +
                    '<td>' +
                    '<input type="radio" name="inlineRadioOptions" id="inlineRadio2" value="' + enteredAddressString + '" data-issuggested=false >' +
                    '</td>' +
                    '<td>' +
                    enteredAddressString +
                    '</td>' +
                '</tr>' +
            '</table>' +
            '</div>' +
            '</div>' +
            '<div class="addr-sugg-footer">' +
            '<button type="button" class="btn btn-default btn-cancel btn-outline-primary" data-dismiss="modal">Cancel</button>' +
            '<button type="button" class="btn btn-primary btn-continue" data-url="' + updateAddressURL + '">Continue</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
    } else if (suggestedAddressString) {
        htmlString = '<!-- Modal -->' +
            '<div class="modal fade address-recommendation" id="chooseValidAddressModal" tabindex="-1" role="dialog">' +
            '<span class="enter-message sr-only" ></span>' +
            '<div class="modal-dialog" ' +
            '<!-- Modal content-->' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            ' <div class="modal-title" id="chooseValidAddressModal">PLEASE VERIFY YOUR ADDRESS </div>' +
            '<div class="modal-title margin-top-24">' +
            'We think some of your details are missing or incorrect. Please take a moment to update - or continue with the below address.' +
            '</div>' +
            '</div>' +
            '<div class="modal-body">' +
            '<div class="modal-title">' +
            'Here’s the address we have.' +
            '</div>' +
            '<div class="margin-top-24 address-format">' +
            suggestedAddressFormatted +
            '</div>' +
            '</div>' +
            '<div class="addr-sugg-footer">' +
            '<button type="button" class="btn btn-default btn-continue btn-outline-primary" data-selectedaddress = "' + suggestedAddressString + '" data-url="' + updateAddressURL + '" data-issuggested=true >That\'s the right address</button>' +
            '<button type="button" class="btn btn-primary btn-cancel" data-dismiss="modal">Update my address</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
    } else {
        htmlString = '<!-- Modal -->' +
            '<div class="modal fade address-recommendation" id="chooseValidAddressModal" tabindex="-1" role="dialog">' +
            '<span class="enter-message sr-only" ></span>' +
            '<div class="modal-dialog" ' +
            '<!-- Modal content-->' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            ' <div class="modal-title" id="chooseValidAddressModal">We think some of your details are missing or incorrect. Please take a moment to update - or continue with the below address.</div>' +
            '</div>' +
            '<div class="modal-body">' +
            '<div class="sub-heading">' +
            '<label class="radio-inline">' +
            'Use the address as you entered below:' +
            '</label>' +
            '</div>' +
            '<div>' +
            '<table>' +
               '<tr>' +
                    '<td>' +
                    '<input type="radio" name="inlineRadioOptions" id="inlineRadio2" value="' + enteredAddressString + '" checked="checked" data-issuggested=false >' +
                    '</td>' +
                    '<td>' +
                    enteredAddressString +
                    '</td>' +
                '</tr>' +
            '</table>' +
            '</div>' +
            '</div>' +
            '<div class="addr-sugg-footer">' +
            '<button type="button" class="btn btn-default btn-cancel btn-outline-primary" data-dismiss="modal">Cancel</button>' +
            '<button type="button" class="btn btn-primary btn-continue" data-url="' + updateAddressURL + '">Continue</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
    }
    $('#chooseValidAddressModal').remove();
    $('body').append(htmlString);
    $('#chooseValidAddressModal').modal('show');
    $('body').trigger('checkout:enableButton', '.next-step-button button');
    $('#chooseValidAddressModal .btn.btn-continue').click(function (e) {
        e.preventDefault();
        var url = $(this).data('url');
        var selectedData;
        var isSuggested;
        if ($("input[name*='inlineRadioOptions']:checked").length > 0) {
            selectedData = $("input[name*='inlineRadioOptions']:checked").val();
            isSuggested = $("input[name*='inlineRadioOptions']:checked").attr('data-issuggested');
        } else {
            selectedData = $(this).data('selectedaddress');
        }

        $.ajax({
            url: url,
            type: 'post',
            data: {
                data: selectedData,
                isSuggested: isSuggested
            },
            dataType: 'json',
            success: function (response) {
                // Only hide modal if the operation is successful - don't want to give a false impression
                if (response.success) {
                    $('#chooseValidAddressModal').modal('hide');
                    $('body').trigger('checkout:enableButton', '.next-step-button button');
                    shippingFormResponse(defer, response);
                    var iFrameUrl = 'iframeUrl' in response ? response.iframeUrl : '';
                    $('#card-iframe').attr('src', iFrameUrl);
                }
            },
            error: function () {
                defer.reject();
            }
        });
    });
    $('#chooseValidAddressModal .btn.btn-cancel').click(function (e) {
        e.preventDefault();
        $('#chooseValidAddressModal').modal('hide');
    });
}

module.exports = base;
base.methods.getShippingAddressValidator = getShippingAddressValidator;
base.methods.shippingFormResponse = shippingFormResponse;
