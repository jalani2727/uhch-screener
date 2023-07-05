'use strict';

var util = require('core/account/util');
var communicationPreferenceValue = $('.edit-profile-card').attr('data-communication-preference');
var COMMUNICATION_PAPERLESS = 'paperless';

/**
 * setDefaultValues - Set default values
 */
function setDefaultValues() {
    switch (communicationPreferenceValue) {
        case COMMUNICATION_PAPERLESS:
            $('#email-communication').prop('checked', false);
            $('#paperless-communication').prop('checked', true);
            break;
        default:
            break;
    }
}

/**
 * onBlurEvents
 */
function onBlurEvents() {
    $('#user-phone').blur(function (e) {
        var phoneNumberValue = (e.target.value).trim();
        e.preventDefault();
        var validationMessage = '';
        if (this.validity.valueMissing || phoneNumberValue === '') {
            this.setCustomValidity('');
            validationMessage = $(this).data('pattern-mismatch');
            $(this).addClass('is-invalid');
            $(this).parents('.form-group').find('.invalid-feedback').text(validationMessage);
        } else if (phoneNumberValue !== '' && !this.validity.valid) {
            this.setCustomValidity('');
            validationMessage = this.validationMessage;
            $(this).addClass('is-invalid');
            if (this.validity.patternMismatch && $(this).data('pattern-mismatch')) {
                validationMessage = $(this).data('pattern-mismatch');
            }
            $(this).parents('.form-group').find('.invalid-feedback').text(validationMessage);
        } else {
            $(this).removeClass('is-invalid');
            $(this).parents('.form-group').find('.invalid-feedback').text('');
        }
    });

    $('#user-zip').blur(function (e) {
        var zipCodeValue = (e.target.value).trim();
        e.preventDefault();
        var validationMessage = '';
        if (this.validity.valueMissing || zipCodeValue === '') {
            this.setCustomValidity('');
            validationMessage = $(this).data('pattern-mismatch');
            $(this).addClass('is-invalid');
            $(this).parents('.form-group').find('.invalid-feedback').text(validationMessage);
        } else if (zipCodeValue !== '' && !this.validity.valid) {
            this.setCustomValidity('');
            validationMessage = this.validationMessage;
            $(this).addClass('is-invalid');
            if (this.validity.patternMismatch && $(this).data('pattern-mismatch')) {
                validationMessage = $(this).data('pattern-mismatch');
            }
            $(this).parents('.form-group').find('.invalid-feedback').text(validationMessage);
        } else {
            $(this).removeClass('is-invalid');
            $(this).parents('.form-group').find('.invalid-feedback').text('');
        }
    });
}

/**
 * submitForm - executes the logic hen a form is submitted.
 */
function submitForm() {
    // Save the updated details
    $('form.edit-profile-details-form').submit(function (e) {
        e.preventDefault();
        var form = $(this);
        var actionUrl = form.attr('action');
        var serializedData = form.serializeArray();
        var parsedData = util.parseData(serializedData);
        $.spinner().start();
        $.ajax({
            url: actionUrl,
            type: 'post',
            dataType: 'json',
            data: {
                data: JSON.stringify(parsedData)
            },
            beforeSend: function () {
                $.spinner().start();
            },
            success: function (result) {
                $('.edit-profile-details-form').trigger('reset');
                window.location.href = result.redirectUrl;
            },
            error: function (err) {
                $('.edit-profile-details-form').trigger('reset');
                $.spinner().stop();
                if (err.responseJSON.redirectUrl) {
                    window.location.href = err.responseJSON.redirectUrl;
                }
            }
        });
        return true;
    });
}

var exportedObjects = { onBlurEvents, submitForm, setDefaultValues };

module.exports = exportedObjects;
