/* eslint-disable linebreak-style */
/* eslint-disable no-undef */
'use strict';

var StringUtils = require('dw/util/StringUtils');
var Calendar = require('dw/util/Calendar');
var Logger = require('dw/system/Logger');
var logger = Logger.getLogger('UPGError', 'upgservice');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Transaction = require('dw/system/Transaction');

/**
 * helper for the payment portal api
 * @param {Object} form - Object
 * @returns {Object} invoice lookup API response
 */
function getInvoiceData(form) {
    var invoiceNumber;
    var dob;
    var invoiceRequestObj = {};

    if (form) {
        invoiceNumber = form.invoiceNumber ? form.invoiceNumber : null;
        dob = form.userDOB ? form.userDOB : null;
        invoiceRequestObj = {
            invoiceId: invoiceNumber,
            dob: StringUtils.formatCalendar(new Calendar(new Date(dob)), 'yyyy-MM-dd')
        };
    }
    var invoiceLookup = require('*/cartridge/scripts/services/InvoiceLookup');
    var invoiceLookupResponse = invoiceLookup.call(invoiceRequestObj, false);
    if (invoiceLookupResponse.error === 401) {
        invoiceLookupResponse = invoiceLookup.call(invoiceRequestObj, true);
    }

    var responseObj = {};
    if (invoiceLookupResponse.error || invoiceLookupResponse.errorMessage) {
        responseObj = { error: true, errorMsg: invoiceLookupResponse.errorMessage };
        return responseObj;
    } else if (invoiceLookupResponse.object && invoiceLookupResponse.object !== null) {
        responseObj = invoiceLookupResponse.object;
    }
    // Check the payment status in Custom object and modify the invoiceBalance.
    if (responseObj && responseObj.invoiceData && responseObj.invoiceData !== null) {
        var isPaymentComplete = false;
        var queryString = 'custom.invoiceId = {0} AND custom.status = \'complete\'';
        var co = CustomObjectMgr.queryCustomObject('UPGPayment', queryString, responseObj.invoiceData.invoiceId);
        if (co && co.custom && co.custom.invoiceId === responseObj.invoiceData.invoiceId && co.custom.status === 'complete') {
            isPaymentComplete = true;
        }
        responseObj.invoiceData.invoiceBalance = !isPaymentComplete && !empty(responseObj.invoiceData.invoiceBalance) ? responseObj.invoiceData.invoiceBalance.toFixed(2) : 0.00;
    }
    return responseObj;
}

/**
 * helper to get the iframe url
 * @param {Object} invoiceData - Object
 * @returns {Object} iframeURL
 */
function getIframeUrl(invoiceData) {
    var upgHPPRedirectEndpointUrl = '';
    try {
        var UPGService = require('*/cartridge/scripts/services/UPGService');
        var preferences = require('*/cartridge/config/preferences.js');
        var URLUtils = require('dw/web/URLUtils');

        var crypto = require('*/cartridge/scripts/helpers/crypto');
        var encryptedInvoiceRecordId = crypto.encrypt(invoiceData.invoiceRecordId);
        var encryptedInvoiceBalance = crypto.encrypt(invoiceData.invoiceBalance);
        var encryptedPatientName = crypto.encrypt(invoiceData.patientName);
        var encryptedInvoiceId = crypto.encrypt(invoiceData.invoiceId);
        var encryptedOpportunityId = crypto.encrypt(invoiceData.opportunityId);

        var returnURL = URLUtils.https(preferences.upgReturnURL_PP, 'invoiceRecordId', encryptedInvoiceRecordId, 'invoiceBalance', encryptedInvoiceBalance, 'patientName', encryptedPatientName, 'invoiceId', encryptedInvoiceId, 'opportunityId', encryptedOpportunityId);
        var cancelURL = URLUtils.https(preferences.upgCancelURL_PP, 'invoiceRecordId', encryptedInvoiceRecordId, 'invoiceBalance', encryptedInvoiceBalance, 'patientName', encryptedPatientName, 'invoiceId', encryptedInvoiceId, 'opportunityId', encryptedOpportunityId);
        var totalGrossPrice = parseInt((parseFloat(invoiceData.invoiceBalance).toFixed(2) * (Math.pow(10, 2))).toFixed(0), 10);

        // Added 1 as last param to indicate that request is coming from paymentPortal
        var requestIDResponse = UPGService.getServiceObj(returnURL, cancelURL, totalGrossPrice, false, 1);
        if (requestIDResponse.error === 401) {
            requestIDResponse = UPGService.getServiceObj(returnURL, cancelURL, totalGrossPrice, true, 1);
        }

        var splitRequest = requestIDResponse.object.text.split('&');
        var splitRequestID = splitRequest.find(function (element) {
            return element.split('=')[0] === 'requestId';
        });

        // handle if request id is not available
        if (!splitRequestID) {
            throw new Error();
        }

        var upgTransactionId = splitRequest.find(function (element) {
            return element.split('=')[0] === 'transactionId';
        });

        // storing transactionId, status and invoiceId to custom object UPGPayment.
        var createCustomObject;
        Transaction.wrap(function () {
            createCustomObject = CustomObjectMgr.createCustomObject('UPGPayment', upgTransactionId.split('=')[1]);
            createCustomObject.custom.status = 'pending';
            createCustomObject.custom.invoiceId = invoiceData.invoiceId;
            createCustomObject.custom.invoiceRecordId = invoiceData.invoiceRecordId;
            createCustomObject.custom.opportunityId = invoiceData.opportunityId ? invoiceData.opportunityId : '';
            createCustomObject.custom.memberEmailAddress = invoiceData.emailAddress ? invoiceData.emailAddress : '';
        });
        session.privacy.paymentPortalTransactionId = upgTransactionId.split('=')[1];
        upgHPPRedirectEndpointUrl = preferences.upgHPPRedirectEndpoint_PP + splitRequestID.split('=')[1];
        return upgHPPRedirectEndpointUrl;
    } catch (e) {
        logger.error('Error while executing UPG service helper.js' + e);
        return upgHPPRedirectEndpointUrl;
    }
}

/**
 * helper for the payment portal collection api
 * @param {Object} invoiceData - Object
 * @returns {Object} collection API response
 */
function createCollectionRecord(invoiceData) {
    var collectionRecordArr = [];
    var collectionRecordRequestObj = {
        invoiceId: invoiceData.invoiceId,
        invoiceRecordId: invoiceData.invoiceRecordId,
        providerTransactionId: invoiceData.providerTransactionId,
        cardHolderName: invoiceData.holderName,
        paidAmount: invoiceData.paidAmount,
        creditCardType: invoiceData.cardType,
        tranactionDate: invoiceData.transactionDate,
        opportunityId: invoiceData.opportunityId
    };
    collectionRecordArr.push(collectionRecordRequestObj);
    var collectionRecordService = require('*/cartridge/scripts/services/CreateCollectionRecord');
    var collectionRecordResponse = collectionRecordService.call(collectionRecordRequestObj, false);
    if (collectionRecordResponse.error === 401) {
        collectionRecordResponse = collectionRecordService.call(collectionRecordRequestObj, true);
    }
    var responseObj = collectionRecordResponse.object ? collectionRecordResponse.object : null;
    collectionRecordArr.push(responseObj);
    return collectionRecordArr;
}

/**
 * helper for the delete custom object with invoiceId and status pending
 * @param {Object} invoiceId - Object
 */
function removePendingCustomObject(invoiceId) {
    try {
        var query = 'custom.status = {0} AND custom.invoiceId = {1}';
        var statusPending = 'pending';
        var coList = CustomObjectMgr.queryCustomObjects('UPGPayment', query, 'creationDate asc', statusPending, invoiceId);
        if (coList.count > 0) {
            while (coList.hasNext()) {
                var co = coList.next();
                // eslint-disable-next-line no-loop-func
                Transaction.wrap(function () {
                    CustomObjectMgr.remove(co);
                });
            }
        }
    } catch (error) {
        Logger.error('error while removing pending status custom objects' + error);
    }
}

/**
 * helper function to send confirmation email for payment portal.
 * @param {string} emailAddress - string
 * @param {Object} customerProfile - Object
 * @param {boolean} fromJob - boolean
 * @param {Object} jobInvoiceData - Object
 */
function paymentPortalSendEmail(emailAddress, customerProfile, fromJob, jobInvoiceData) {
    var emailHelpers = require('*/cartridge/scripts/helpers/emailHelpers');
    var preferences = require('*/cartridge/config/preferences.js');
    var Resource = require('dw/web/Resource');
    var invoiceData = {};
    var contactObj = {};
    if (session.privacy.paymentPortalInvoiceData) {
        invoiceData = JSON.parse(session.privacy.paymentPortalInvoiceData);
        contactObj.FirstName = (invoiceData.patientName).split(' ')[0];
        contactObj.PaymentDate = invoiceData.formattedTransactionDate;
        contactObj.InvoiceNumber = invoiceData.invoiceId;
        contactObj.PaymentType = invoiceData.cardType;
        contactObj.CardNumber = invoiceData.accountNumberMasked;
        contactObj.TotalPaid = invoiceData.paidAmount;
    } else if (fromJob) {
        contactObj.FirstName = (jobInvoiceData.holderName).split(' ')[0];
        contactObj.PaymentDate = jobInvoiceData.formattedTransactionDate;
        contactObj.InvoiceNumber = jobInvoiceData.invoiceId;
        contactObj.PaymentType = jobInvoiceData.cardType;
        contactObj.CardNumber = jobInvoiceData.accountNumberMasked;
        contactObj.TotalPaid = jobInvoiceData.paidAmount;
    }
    contactObj.SiteID = require('dw/system/Site').current.ID;
    contactObj.SubscriberKey = customerProfile && customerProfile.custom && 'sfdcContactID' in customerProfile.custom ? customerProfile.custom.sfdcContactID : emailAddress;
    contactObj.Address = emailAddress;

    var emailObj = {};
    emailObj.to = emailAddress;
    emailObj.subject = Resource.msg('subject.contactus.email', 'paymentportal', null);
    emailObj.from = preferences.customerSvcMail || 'no-reply@salesforce.com';
    emailObj.type = emailHelpers.emailTypes.paymentPortal;
    emailHelpers.sendEmail(emailObj, null, contactObj);
}

module.exports = {
    getInvoiceData: getInvoiceData,
    getIframeUrl: getIframeUrl,
    createCollectionRecord: createCollectionRecord,
    removePendingCustomObject: removePendingCustomObject,
    paymentPortalSendEmail: paymentPortalSendEmail
};
