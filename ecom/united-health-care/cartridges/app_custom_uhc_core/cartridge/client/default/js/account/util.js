'use strict';

var $noIsuranceInput = $('#no-insurance');
var $healthPlanNameInput = $('#health-plan-name');
var otherHealthPlanValue = $('.create-account-page').attr('data-health-plan-other');
var noInsuranceInputId = 'no-insurance';
var userConsentInputId = 'user-consent';
var healthPlanNameInputId = 'health-plan-name';
var memberIdInputId = 'member-id';
var userDOBInputId = 'user-dob';
var otherHealthPlanInputId = 'other-health-plan';
var $createAccountbtnClass = $('.btn-create-account');
var $userConsentInput = $('#user-consent');
var dateToday = new Date();
var maxDateAllowedAsDob = new Date();
maxDateAllowedAsDob.setFullYear(maxDateAllowedAsDob.getFullYear() - 13);

/**
 * Returns the Parsed Serialized array of Form object.
 * @param {Array} serializedData - Serialized array of Form Object
 * @return {Object} formData - formData
 */
function parseData(serializedData) {
    let formData = {};
    serializedData.forEach(function (key) {
        formData[key.name] = key.value;
    });
    return formData;
}

/**
 * allowFormSubmit - Checks the form validation and if valid, allows the submit.
 */
function allowFormSubmit() {
    var requiredFieldEmpty = false;
    var formInputElements = $('form input');

    for (let inputElement of formInputElements) {
        let inputValue = inputElement.value.trim();
        if ($noIsuranceInput.is(':checked') && inputElement.id !== noInsuranceInputId && inputElement.id !== healthPlanNameInputId && inputElement.id !== otherHealthPlanInputId && inputElement.id !== memberIdInputId && inputElement.id !== userConsentInputId && inputValue === '') {
            requiredFieldEmpty = true;
            break;
        } else if ($noIsuranceInput.is(':checked') && inputElement.id === userConsentInputId && !$userConsentInput.is(':checked')) {
            requiredFieldEmpty = true;
            break;
        } else if (!$noIsuranceInput.is(':checked') && inputElement.id === userConsentInputId && !$userConsentInput.is(':checked')) {
            requiredFieldEmpty = true;
            break;
        } else if (!$noIsuranceInput.is(':checked') && inputElement.required && inputElement.id !== otherHealthPlanInputId && inputValue === '') {
            requiredFieldEmpty = true;
            break;
        } else if (!$noIsuranceInput.is(':checked') && inputElement.id === otherHealthPlanInputId && $healthPlanNameInput && $healthPlanNameInput[0] && $healthPlanNameInput[0].value === otherHealthPlanValue && inputValue === '') {
            requiredFieldEmpty = true;
            break;
        }
        if (inputElement.id === userDOBInputId) {
            var dobValue = inputElement.value;
            var selectedDobValueFormatted = new Date(dobValue);
            var isDobInvalid = selectedDobValueFormatted > maxDateAllowedAsDob && selectedDobValueFormatted <= dateToday;
            var isFutureDobSelected = selectedDobValueFormatted > dateToday;
            if (dobValue !== '' && (isDobInvalid || isFutureDobSelected)) {
                requiredFieldEmpty = true;
                break;
            }
        }
        if (!inputElement.validity.valid) {
            requiredFieldEmpty = true;
            break;
        }
    }

    if (requiredFieldEmpty) {
        $createAccountbtnClass.addClass('disabled');
        $createAccountbtnClass.attr('disabled', true);
    } else {
        $createAccountbtnClass.removeClass('disabled');
        $createAccountbtnClass.removeAttr('disabled');
    }
}

var exportedObjects = { parseData, allowFormSubmit };

module.exports = exportedObjects;
