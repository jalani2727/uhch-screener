'use strict';
var server = require('server');
var StringUtils = require('dw/util/StringUtils');
var Calendar = require('dw/util/Calendar');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var pageMetaData = require('*/cartridge/scripts/middleware/pageMetaData');
var Site = require('dw/system/Site');

/**
 * PaymentPortal-Show : This endpoint is called to load Payment Portal landing page
 * @name PaymentPortal-Show
 * @function
 * @memberof PaymentPortal
 * @param {middleware} - server.middleware.https
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('Show', server.middleware.https, csrfProtection.generateToken, function (req, res, next) {
    var currentSiteID = Site.current.ID;
    var currentSitePipeline = 'Sites-' + currentSiteID + '-Site';
    var preferences = require('*/cartridge/config/preferences.js');
    var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
    if (req.pageMetaData.title === currentSitePipeline) {
        var nameObj = JSON.parse(preferences.pageMetaTitle);
        var title = {};
        title.pageTitle = nameObj['PaymentPortal-Show'] ? nameObj['PaymentPortal-Show'].pageTitle : currentSitePipeline;
        pageMetaHelper.setPageMetaData(req.pageMetaData, title);
    }
    var URLUtils = require('dw/web/URLUtils');
    var actionUrl = URLUtils.url('PaymentPortal-InvoiceLookup').toString();
    var maxDate = StringUtils.formatCalendar(new Calendar(new Date()), 'yyyy-MM-dd');
    res.render('paymentPortal/paymentPortalLandingPage', {
        actionUrl: actionUrl,
        maxDate: maxDate,
        recaptchaKey: preferences.recaptchaSiteKey,
        recaptchaEnable: preferences.enableRecaptcha
    });
    next();
}, pageMetaData.computedPageMetaData
);

/**
 * PaymentPortal-InvoiceLookup : This endpoint is used to do invoice lookup
 * @name PaymentPortal-InvoiceLookup
 * @function
 * @memberof PaymentPortal
 * @param {middleware} - server.middleware.https
 * @param {renders} - isml
 * @param {serverfunction} - post
 */
server.post('InvoiceLookup', server.middleware.https, csrfProtection.validateAjaxRequest, function (req, res, next) {
    var form = req.form.data ? JSON.parse(req.form.data) : null;
    var captchaVerifySVC = require('*/cartridge/scripts/services/RecaptchaVerify.js');
    var preferences = require('*/cartridge/config/preferences.js');
    var Resource = require('dw/web/Resource');
    var URLUtils = require('dw/web/URLUtils');
    var Logger = require('dw/system/Logger');
    var verifyCaptcha = true;

    try {
        if (preferences.enableRecaptcha) {
            var captchaResponse = form['g-recaptcha-response'];

            // Validating if user has checked the recaptcha
            if (empty(captchaResponse)) {
                res.json({
                    error: true,
                    captchaError: true,
                    errorMsg: Resource.msg('error.msg.verify-captcha', 'paymentportal', null)
                });
                return next();
            }
            var captchaService = captchaVerifySVC.call(captchaResponse);
            verifyCaptcha = captchaService.object.success ? captchaService.object.success : false;
        }

        // Invoice lookup call.
        var responseObj = {};
        if (verifyCaptcha) {
            var paymentPortalHelper = require('*/cartridge/scripts/helpers/paymentPortalHelper');
            responseObj = paymentPortalHelper.getInvoiceData(form);
        }

        if (responseObj && (responseObj.error || responseObj.statusCode > 0)) {
            var errorObj = {
                error: true,
                errorMsg: Resource.msg('error.msg.invoice-service-unavailable', 'paymentportal', null),
                statusCode: responseObj && responseObj.statusCode ? responseObj.statusCode : -1,
                redirectUrl: URLUtils.url('PaymentPortal-Show').toString()
            };
            if (responseObj.statusCode === 1) {
                // if invoiceID or DOB is invalid
                errorObj.errorMsg = Resource.msg('error.msg.no-match-found', 'paymentportal', null);
            } else if (responseObj.statusCode === 2) {
                // if there has been a change in invoice Balance
                errorObj.errorMsg = Resource.msg('error.msg.change-in-cost', 'paymentportal', null);
            }
            res.json(errorObj);
        } else if (!empty(responseObj.invoiceData)) {
            var invoiceData = responseObj.invoiceData;
            if (!empty(invoiceData.invoiceBalance) && invoiceData.invoiceBalance > 0) {
                var customerProfile = req.currentCustomer && req.currentCustomer.raw ? req.currentCustomer.raw : {};
                if (empty(invoiceData.memberEmailAddress)) {
                    if (customerProfile && customerProfile.profile && customerProfile.profile.email) {
                        invoiceData.memberEmailAddress = customerProfile.profile.email;
                    } else {
                        invoiceData.memberEmailAddress = '';
                    }
                }
                // if invoice balance is more than 0, call the UPG service and redirect to payment page.
                res.json({
                    error: false,
                    continueURL: URLUtils.url('PaymentPortal-PaymentPage').toString(),
                    patientName: invoiceData.patientName,
                    invoiceId: invoiceData.invoiceId,
                    invoiceBalance: invoiceData.invoiceBalance,
                    invoiceRecordId: invoiceData.invoiceRecordId,
                    opportunityId: invoiceData.opportunityId,
                    products: invoiceData.products ? invoiceData.products : null,
                    emailAddress: invoiceData.memberEmailAddress
                });
            } else if (!empty(invoiceData.invoiceBalance) && invoiceData.invoiceBalance <= 0) {
                // if invoice balance is 0, then call controller to render No Payment page.
                res.json({
                    error: false,
                    continueURL: URLUtils.url('PaymentPortal-NoPaymentPage').toString(),
                    patientName: invoiceData.patientName,
                    invoiceId: invoiceData.invoiceId,
                    invoiceBalance: invoiceData.invoiceBalance,
                    invoiceRecordId: invoiceData.invoiceRecordId
                });
            }
        }
    } catch (e) {
        Logger.error('Error while executing invoice data lookup ' + e);
    }
    return next();
});

/**
 * PaymentPortal-PaymentPage : This endpoint is called to load Payment page
 * @name Base/PaymentPortal-PaymentPage
 * @function
 * @memberof PaymentPortal
 * @param {renders} - isml
 * @param {serverfunction} - use
 */
server.use('PaymentPage', function (req, res, next) {
    var currentSiteID = Site.current.ID;
    var currentSitePipeline = 'Sites-' + currentSiteID + '-Site';
    var preferences = require('*/cartridge/config/preferences.js');
    var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
    if (req.pageMetaData.title === currentSitePipeline) {
        var nameObj = JSON.parse(preferences.pageMetaTitle);
        var title = {};
        title.pageTitle = nameObj['PaymentPortal-PaymentPage'] ? nameObj['PaymentPortal-PaymentPage'].pageTitle : currentSitePipeline;
        pageMetaHelper.setPageMetaData(req.pageMetaData, title);
    }
    var URLUtils = require('dw/web/URLUtils');
    var paymentPortalHelper = require('*/cartridge/scripts/helpers/paymentPortalHelper');

    var invoiceData = {};
    var formData = req.form;
    var productList = !empty(formData.products) ? JSON.parse(formData.products) : null;
    if (!empty(formData.invoiceBalance) && !empty(formData.patientName) && !empty(formData.invoiceId) && !empty(formData.invoiceRecordId)) {
        invoiceData = {
            invoiceBalance: formData.invoiceBalance,
            patientName: formData.patientName,
            invoiceId: formData.invoiceId,
            invoiceRecordId: formData.invoiceRecordId,
            opportunityId: formData.opportunityId,
            paymentFail: false,
            products: productList,
            emailAddress: formData.emailAddress
        };
    } else if (session.privacy.paymentPortalInvoiceData) {
        invoiceData = JSON.parse(session.privacy.paymentPortalInvoiceData);
        delete session.privacy.paymentPortalInvoiceData;
    } else {
        res.redirect(URLUtils.url('PaymentPortal-Show'));
        next();
    }
    invoiceData.iframeURL = Object.keys(invoiceData).length > 0 ? paymentPortalHelper.getIframeUrl(invoiceData) : '';
    res.render('paymentPortal/paymentPortalPaymentPage', {
        invoiceBalance: invoiceData.invoiceBalance,
        patientName: invoiceData.patientName,
        invoiceId: invoiceData.invoiceId,
        iframeURL: invoiceData.iframeURL,
        invoiceRecordId: invoiceData.invoiceRecordId,
        paymentFail: invoiceData.paymentFail,
        products: invoiceData.products
    });
    next();
}, pageMetaData.computedPageMetaData
);

/**
 * PaymentPortal-NoPaymentPage : This endpoint is called to load No Payment page
 * @name Base/PaymentPortal-NoPaymentPage
 * @function
 * @memberof PaymentPortal
 * @param {renders} - isml
 * @param {serverfunction} - post
 */
server.post('NoPaymentPage', function (req, res, next) {
    var currentSiteID = Site.current.ID;
    var currentSitePipeline = 'Sites-' + currentSiteID + '-Site';
    var preferences = require('*/cartridge/config/preferences.js');
    var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
    if (req.pageMetaData.title === currentSitePipeline) {
        var nameObj = JSON.parse(preferences.pageMetaTitle);
        var title = {};
        title.pageTitle = nameObj['PaymentPortal-NoPaymentPage'] ? nameObj['PaymentPortal-NoPaymentPage'].pageTitle : currentSitePipeline;
        pageMetaHelper.setPageMetaData(req.pageMetaData, title);
    }
    var URLUtils = require('dw/web/URLUtils');
    var formData = req.form;
    if (empty(formData.invoiceBalance) || empty(formData.patientName) || empty(formData.invoiceId) || empty(formData.invoiceRecordId)) {
        res.redirect(URLUtils.url('PaymentPortal-Show'));
    } else {
        var invoiceData = {
            invoiceBalance: parseFloat(formData.invoiceBalance),
            patientName: formData.patientName,
            invoiceId: formData.invoiceId,
            invoiceRecordId: formData.invoiceRecordId
        };

        res.render('paymentPortal/paymentPortalNoPaymentPage', {
            invoiceBalance: invoiceData.invoiceBalance,
            patientName: invoiceData.patientName,
            invoiceId: invoiceData.invoiceId,
            invoiceRecordId: invoiceData.invoiceRecordId
        });
    }
    next();
}, pageMetaData.computedPageMetaData
);

/**
 * PaymentPortal-Confirmation : This endpoint is called to load Payment confirmation page
 * @name Base/PaymentPortal-Confirmation
 * @function
 * @memberof PaymentPortal
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('Confirmation', function (req, res, next) {
    var currentSiteID = Site.current.ID;
    var currentSitePipeline = 'Sites-' + currentSiteID + '-Site';
    var preferences = require('*/cartridge/config/preferences.js');
    var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
    if (req.pageMetaData.title === currentSitePipeline) {
        var nameObj = JSON.parse(preferences.pageMetaTitle);
        var title = {};
        title.pageTitle = nameObj['PaymentPortal-Confirmation'] ? nameObj['PaymentPortal-Confirmation'].pageTitle : currentSitePipeline;
        pageMetaHelper.setPageMetaData(req.pageMetaData, title);
    }
    var URLUtils = require('dw/web/URLUtils');
    var actionUrl = URLUtils.url('PaymentPortal-SendEmail').toString();
    if (session.privacy.paymentPortalInvoiceData) {
        var invoiceData = JSON.parse(session.privacy.paymentPortalInvoiceData);
        res.render('paymentPortal/paymentPortalConfirmationPage', { invoiceData: invoiceData, actionURL: actionUrl });
    } else {
        res.redirect(URLUtils.url('PaymentPortal-Show'));
    }
    next();
}, pageMetaData.computedPageMetaData
);

/**
 * PaymentPortal-SendEmail : This endpoint is to send an email
 * @name Base/PaymentPortal-SendEmail
 * @function
 * @memberof PaymentPortal
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('SendEmail', function (req, res, next) {
    var paymentPortalHelper = require('*/cartridge/scripts/helpers/paymentPortalHelper');
    var emailAdd = req.querystring.emailAddress;
    var customerProfile = req.currentCustomer && req.currentCustomer.raw ? req.currentCustomer.raw : {};
    // Sending Mail
    paymentPortalHelper.paymentPortalSendEmail(emailAdd, customerProfile.profile);
    next();
});

module.exports = server.exports();

