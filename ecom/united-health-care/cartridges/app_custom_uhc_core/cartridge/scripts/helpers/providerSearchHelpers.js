'use strict';
var Resource = require('dw/web/Resource');

/**
 * Get error message
 * @param {errMessage} errMessage response.object.errMessage
 * @returns {string} error
 */
function getErrorMessage(errMessage) {
    var msg = errMessage.split(':');
    var error = '';
    if (msg[1] === Resource.msg('error.api.email', 'forms', null)) {
        error = Resource.msg('error.message.form.invalid-email', 'forms', null);
    } else if (msg[1] === Resource.msg('error.api.date', 'forms', null)) {
        error = Resource.msg('error.message.date.appointment.form', 'providersearch', null);
    }
    return error;
}

module.exports = {
    getErrorMessage: getErrorMessage
};
