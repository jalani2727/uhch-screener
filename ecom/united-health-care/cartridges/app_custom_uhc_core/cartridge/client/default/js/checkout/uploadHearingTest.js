'use strict';

var util = require('../hearingTest/util');
var fileUploadInputSelector = '.upload-hearing-test-form #hearing-test-file';
var fileUploadFormSelector = '.upload-hearing-test-form';
var errorMessageSelector = '.upload-hearing-test-form .error-message-text';

/**
 * Returns Form Element
 * @returns {JQuery} jQuery element
 */
function getUploadHearingTestForm() {
    return $(fileUploadFormSelector);
}

/**
 * Shows file upload mandatory error message
 */
function showMandatoryErrorMessage() {
    var $errorMessageEl = $(errorMessageSelector);
    var mandatoryFieldError = $errorMessageEl.data('mandatory-field-error-message');
    $errorMessageEl.text(mandatoryFieldError).show();
}

/**
 * Shows file upload api error message
 * @param {string} msg - A message string
 */
function showApiErrorMessage(msg) {
    var $errorMessageEl = $(errorMessageSelector);
    var apiError = msg || $errorMessageEl.data('api-error-message');
    $errorMessageEl.text(apiError).show();
}

/**
 * Hides file upload mandatory error message
 */
function hideErrorMessage() {
    $(errorMessageSelector).text('').hide();
}

/**
 * Returns a boolean flag if the hearing test is already exists or not
 * @returns {boolean} - true or false
 */
function hasExistingHearingTestData() {
    return $(fileUploadInputSelector).attr('data-has-existing-test-data') === 'true';
}

/**
 * Clears out existing hearing test data from dom
 */
function clearExistingHearingTestData() {
    $('.existing-file-details').remove();
    $(fileUploadInputSelector).attr('data-has-existing-test-data', 'false');
}

module.exports = {
    initializeFileUploadEvents: function () {
        $(fileUploadInputSelector).change(function (e) {
            e.preventDefault();
            $('.file-name').remove();
            $('.file-upload-label').remove();
            $('.check-mark-success').hide();
            clearExistingHearingTestData();

            var currentTarget = e.currentTarget;
            if ('files' in currentTarget) {
                var files = currentTarget.files;
                var allowedfilelength = parseInt($('input[name=allowed-file-length]').val(), 10) * 1000000;
                if (files[0].size > allowedfilelength) {
                    $('.upload-file-error').html('<span class="file-upload-error" style="color:red;">The file is too large to be uploaded. The maximum file size is ' + allowedfilelength + 'MB. </span>');
                    return;
                }
                util.fileRead(files[0]);

                // to display name of the uploaded file
                $('.file-name-container').append(
                    '<span class="file-name">' + files[0].name + '</span>'
                );
                $('.check-mark-success').show();
            }
        });
    },
    parseUploadHearingTestFormData: util.parseData,
    getUploadHearingTestForm: getUploadHearingTestForm,
    getFilesData: util.getFilesData,
    showMandatoryErrorMessage: showMandatoryErrorMessage,
    showApiErrorMessage: showApiErrorMessage,
    hideErrorMessage: hideErrorMessage,
    hasExistingHearingTestData: hasExistingHearingTestData
};
