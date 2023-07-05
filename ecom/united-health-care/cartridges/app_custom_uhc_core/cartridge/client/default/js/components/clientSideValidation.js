'use strict';

var base = require('base/components/clientSideValidation');

/**
 * update validation for the textarea field
 */
function invalid() {
    $('form input, form select, form textarea').on('invalid', function (e) {
        e.preventDefault();
        this.setCustomValidity('');
        if (!this.validity.valid) {
            var validationMessage = this.validationMessage;
            $(this).addClass('is-invalid');
            if (this.validity.patternMismatch && $(this).data('pattern-mismatch')) {
                validationMessage = $(this).data('pattern-mismatch');
            }
            if ((this.validity.rangeOverflow || this.validity.rangeUnderflow)
                && $(this).data('range-error')) {
                validationMessage = $(this).data('range-error');
            }
            if ((this.validity.tooLong || this.validity.tooShort)
                && $(this).data('range-error')) {
                validationMessage = $(this).data('range-error');
            }
            if (this.validity.valueMissing && $(this).data('missing-error')) {
                validationMessage = $(this).data('missing-error');
            }
            $(this).parents('.form-group').find('.invalid-feedback')
                .text(validationMessage);
        }
    });
}

module.exports = base;
base.invalid = invalid;
