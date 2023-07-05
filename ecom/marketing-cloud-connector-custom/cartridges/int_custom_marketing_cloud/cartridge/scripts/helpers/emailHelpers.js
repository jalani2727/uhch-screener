'use strict';

var base = module.superModule;

base.emailTypes = {
    registration: 1,
    passwordReset: 2,
    passwordChanged: 3,
    orderConfirmation: 4,
    accountLocked: 5,
    accountEdited: 6,
    contactUs: 7,
    appointmentRequest: 8,
    hearingTest: 9,
    paymentPortal: 10
};

module.exports = base;
