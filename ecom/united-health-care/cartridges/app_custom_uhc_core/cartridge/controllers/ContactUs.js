'use strict';

var server = require('server');
server.extend(module.superModule);
var preferences = require('*/cartridge/config/preferences.js');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var pageMetaData = require('*/cartridge/scripts/middleware/pageMetaData');
var Site = require('dw/system/Site');
var currentSiteID = Site.current.ID;
var currentSitePipeline = 'Sites-' + currentSiteID + '-Site';

/**
 * ContactUs-Landing : This endpoint is called to load contact us landing page
 * @name Base/ContactUs-Landing
 * @function
 * @memberof ContactUs
 * @param {middleware} - server.middleware.https
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.append('Landing', csrfProtection.generateToken, function (req, res, next) {
    var StringUtils = require('dw/util/StringUtils');
    var Calendar = require('dw/util/Calendar');
    var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
    if (req.pageMetaData.title === currentSitePipeline) {
        var nameObj = JSON.parse(preferences.pageMetaTitle);
        var title = {};
        title.pageTitle = nameObj['ContactUs-Landing'] ? nameObj['ContactUs-Landing'].pageTitle : currentSitePipeline;
        pageMetaHelper.setPageMetaData(req.pageMetaData, title);
    }
    var viewData = res.getViewData();
    viewData.recaptchaKey = preferences.recaptchaSiteKey;
    viewData.recaptchaEnable = preferences.enableRecaptcha;
    var customer = req.currentCustomer.raw;
    var maxDate = StringUtils.formatCalendar(new Calendar(new Date()), 'yyyy-MM-dd');

    if (customer.profile) {
        viewData.profile = {
            firstName: customer.profile.firstName || '',
            lastName: customer.profile.lastName || '',
            email: customer.profile.email || '',
            phone: customer.profile.phoneHome || '',
            dob: StringUtils.formatCalendar(new Calendar(session.privacy.profilebirthdate), 'yyyy-MM-dd') || ''
        };
    }
    viewData.maxDate = maxDate;
    viewData.oauthLoginTargetEndPoint = 6;
    res.setViewData(viewData);
    next();
}, pageMetaData.computedPageMetaData);

/**
 * ContactUs-Subscribe : This endpoint is called to submit the shopper's contact information
 * @name Base/ContactUs-Subscribe
 * @function
 * @memberof ContactUs
 * @param {middleware} - server.middleware.https
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.replace('Subscribe', server.middleware.post, server.middleware.https, csrfProtection.validateAjaxRequest, function (req, res, next) {
    var Resource = require('dw/web/Resource');
    var createLeadSvc = require('*/cartridge/scripts/services/CreateLeadService.js');
    var captchaVerifySVC = require('*/cartridge/scripts/services/RecaptchaVerify.js');
    var URLUtils = require('dw/web/URLUtils');
    var emailHelper = require('*/cartridge/scripts/helpers/emailHelpers');
    var customer = req.currentCustomer.raw;
    var myForm = req.form;
    var recaptchaEnable = preferences.enableRecaptcha;
    var captchaVerify = true;

    if (recaptchaEnable) {
        var captchaResponse = req.form['g-recaptcha-response'];
        // Validating if user has checked the recaptcha
        if (empty(captchaResponse)) {
            return res.json({
                error: true,
                captchaError: true,
                msg: Resource.msg('text.captcha.error', 'contactUs', null)
            });
        }
        var captchaService = captchaVerifySVC.call(captchaResponse);
        captchaVerify = captchaService.object.success ? captchaService.object.success : false;
    }

    // Validating if user's recaptcah response is valid
    if (captchaVerify) {
        var isValidEmailid = emailHelper.validateEmail(myForm.contactEmail);
        if (isValidEmailid) {
            // request Object for creating lead service
            var contactInfo = {
                lastName: myForm.contactLastName,
                firstName: myForm.contactFirstName,
                dob: myForm.contactDob,
                street: myForm.contactStreet,
                state: myForm.contactState,
                city: myForm.contactCity,
                zipCode: myForm.contactZipCode,
                phone: myForm.contactPhone,
                email: myForm.contactEmail,
                reasonForInquiry: myForm.contactTopic,
                commentsContacUs: myForm.contactComment,
                isAuthenticated: !!customer.profile,
                sfcccontactId: customer.profile && 'sfdcContactID' in customer.profile.custom ? customer.profile.custom.sfdcContactID : '',
                form: 'contact'
            };
            var response = createLeadSvc.call(contactInfo, false);
            if (response.error === 401) {
                response = createLeadSvc.call(contactInfo, true);
            }

            // If it is success then we are re-directing to ContactUS Confirmation page else displaying an error
            if (response.ok && response.object && response.object.response.isSuccess) {
                var contactObj = {
                    LastName: myForm.contactLastName,
                    FirstName: myForm.contactFirstName,
                    Phone: myForm.contactPhone,
                    EmailAddress: myForm.contactEmail,
                    MyQuestion: myForm.contactTopic,
                    Comment: myForm.contactComment,
                    SubscriberKey: customer.profile && 'sfdcContactID' in customer.profile.custom ? customer.profile.custom.sfdcContactID : myForm.contactEmail
                };
                // Sending Mail
                var emailHelpers = require('*/cartridge/scripts/helpers/emailHelpers');
                var emailObj = {
                    to: contactInfo.email,
                    subject: Resource.msg('subject.contactus.email', 'contactUs', null),
                    from: Site.current.getCustomPreferenceValue('customerServiceEmail') || 'no-reply@salesforce.com',
                    type: emailHelpers.emailTypes.contactUs
                };

                emailHelpers.sendEmail(emailObj, 'contactUs/contactusEmail', contactObj);
                res.json({
                    success: true,
                    msg: Resource.msg('subscribe.to.contact.us.success', 'contactUs', null),
                    redirectUrl: URLUtils.url('ContactUs-Confirm').toString()
                });
            } else if (response.object && response.object.errMessage) {
                var errMessage = response.object.errMessage;
                var error = errMessage.split(':');
                if (error[1] === Resource.msg('error.api.date', 'forms', null)) {
                    res.json({
                        error: true,
                        msg: Resource.msg('error.message.form.invalid.date', 'forms', null)
                    });
                } else {
                    res.json({
                        error: true,
                        msg: Resource.msg('subscribe.to.contact.us.data.invalid', 'contactUs', null)
                    });
                }
            }
        } else {
            res.json({
                error: true,
                msg: Resource.msg('subscribe.to.contact.us.email.invalid', 'contactUs', null)
            });
        }
    } else {
        res.json({
            error: true,
            msg: Resource.msg('text.captcha.error', 'contactUs', null)
        });
    }
    return next();
});

/**
 * ContactUs-Confirm : This renders confirmation page when the lead is create successfully from contactus
 * @name Base/ContactUs-Confirm
 * @function
 * @memberof ContactUs
 * @param {middleware} - server.middleware.https
 * @param {renders} - isml
 * @param {serverfunction} - post
 */
server.post('Confirm', server.middleware.https, function (req, res, next) {
    var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
    var nameObj = JSON.parse(preferences.pageMetaTitle);
    var title = {};
    title.pageTitle = nameObj['ContactUs-Confirm'] ? nameObj['ContactUs-Confirm'].pageTitle : currentSitePipeline;
    pageMetaHelper.setPageMetaData(req.pageMetaData, title);
    res.render('contactUs/contactUsConfirmation');
    next();
}, pageMetaData.computedPageMetaData);

module.exports = server.exports();
