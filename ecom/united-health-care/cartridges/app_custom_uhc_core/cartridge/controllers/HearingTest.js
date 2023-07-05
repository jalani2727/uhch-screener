'use strict';

/**
 * @namespace HearingTest
 */

var server = require('server');
var Resource = require('dw/web/Resource');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var ContentMgr = require('dw/content/ContentMgr');
var pageMetaData = require('*/cartridge/scripts/middleware/pageMetaData');
var preferences = require('*/cartridge/config/preferences.js');
var Site = require('dw/system/Site');
var currentSiteID = Site.current.ID;
var currentSitePipeline = 'Sites-' + currentSiteID + '-Site';

/**
 * HearingTest-Landing : This endpoint is called to load hearing test landing page
 * @name Base/ContactUs-IFrameLanding
 * @function
 * @memberof HearingTest
 * @param {middleware} - server.middleware.https
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('Landing', server.middleware.https, function (req, res, next) {
    var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');

    delete session.custom.hearingresult;
    var content = ContentMgr.getContent('hearingtest-landing');
    if (content) {
        pageMetaHelper.setPageMetaData(req.pageMetaData, content);
    }
    res.render('hearingtest/hearingtestLanding', {
        oauthLoginTargetEndPoint: 4
    });
    next();
}, pageMetaData.computedPageMetaData);

/**
 * HearingTest-IFrameLanding : This endpoint is called to load IFrame from Senova
 * @name Base/HearingTest-IFrameLanding
 * @function
 * @memberof HearingTest
 * @param {middleware} - server.middleware.https
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('IFrameLanding', server.middleware.https, function (req, res, next) {
    var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
    if (req.pageMetaData.title === currentSitePipeline) {
        var nameObj = JSON.parse(preferences.pageMetaTitle);
        var title = {};
        title.pageTitle = nameObj['HearingTest-IFrameLanding'] ? nameObj['HearingTest-IFrameLanding'].pageTitle : currentSitePipeline;
        pageMetaHelper.setPageMetaData(req.pageMetaData, title);
    }
    var screenerIDDesktop = preferences.screenerIDDesktop;
    var screenerIDMobile = preferences.screenerIDMobile;
    var defaultAppID = preferences.defaultAppID;
    var sonarBaseURL = preferences.sonarBaseURL;
    var screenerID = screenerIDDesktop;
    var testingHelpers = require('*/cartridge/scripts/helpers/utilHelpers.js');
    if (!testingHelpers.isDesktopDevice()) {
        screenerID = screenerIDMobile;
    }
    var appID = !empty(session.custom.appID) ? session.custom.appID : defaultAppID;
    var hearingTestDesktopURL = sonarBaseURL + screenerID + '/age-range?appId=' + appID;
    res.render('hearingtest/hearingtestIframe.isml', {
        stage: Resource.msg('lifestyle.stage.1', 'hearingtest', null),
        hearingTestDesktopURL: hearingTestDesktopURL
    });
    next();
}, pageMetaData.computedPageMetaData);

/**
 * HearingTest-LifestyleQuestions : This endpoint will be redirect from sonova
 * and display LifestyleQuestions pages
 * @name Base/HearingTest-LifestyleQuestions
 * @function
 * @memberof HearingTest
 * @param {middleware} - server.middleware.https
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('LifestyleQuestions', server.middleware.https, function (req, res, next) {
    var resultId = req.querystring.screenerResultId;
    session.custom.resultId = resultId;
    var URLUtils = require('dw/web/URLUtils');
    var urlredirect = URLUtils.url('HearingTest-Lifestyle').toString();
    res.render('hearingtest/iframeredirect', {
        urlredirect: urlredirect
    });
    next();
}, pageMetaData.computedPageMetaData);

/**
 * HearingTest-Lifestyle : This endpoint will be redirect from iframe
 * and display Lifestyle Questions pages
 * @name Base/HearingTest-Lifestyle
 * @function
 * @memberof HearingTest
 * @param {middleware} - server.middleware.https
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('Lifestyle', server.middleware.https, function (req, res, next) {
    var CustomObjectMgr = require('dw/object/CustomObjectMgr');
    var lifestyleFirstQuestionsID = preferences.lifestyleFirstQuestionsID;
    var customObjects = CustomObjectMgr.getAllCustomObjects('LifestyleQuestions');
    var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
    if (req.pageMetaData.title === currentSitePipeline) {
        var nameObj = JSON.parse(preferences.pageMetaTitle);
        var title = {};
        title.pageTitle = nameObj['HearingTest-Lifestyle'] ? nameObj['HearingTest-Lifestyle'].pageTitle : currentSitePipeline;
        pageMetaHelper.setPageMetaData(req.pageMetaData, title);
    }
    res.render('hearingtest/lifestyleQuestions', {
        lifestyleFirstQuestionsID: lifestyleFirstQuestionsID,
        stage: Resource.msg('lifestyle.stage.2', 'hearingtest', null),
        customObjects: customObjects
    });
    next();
}, pageMetaData.computedPageMetaData);

/**
 * HearingTest-LifestyleSubmit : This endpoint will be submit the Lifestyle answers
 * and store in the customoject and dispaly guest form
 * @name Base/HearingTest-LifestyleSubmit
 * @function
 * @memberof HearingTest
 * @param {middleware} - server.middleware.https
 * @param {renders} - isml
 * @param {serverfunction} - post
 */
server.post('LifestyleSubmit', server.middleware.https, function (req, res, next) {
    var CustomObjectMgr = require('dw/object/CustomObjectMgr');
    var Transaction = require('dw/system/Transaction');
    var URLUtils = require('dw/web/URLUtils');

    try {
        var resultId = session.custom.resultId;
        var selectedValue = req.querystring.requestObj;
        var questionAnswers = { questions: selectedValue };
        var createCustomObject;

        Transaction.wrap(function () {
            createCustomObject = CustomObjectMgr.createCustomObject('LifestyleAnswer', resultId);
            createCustomObject.custom.questionAnswers = JSON.stringify(questionAnswers);
        });
    } catch (e) {
        res.json({
            success: true,
            redirectUrl: URLUtils.https('HearingTest-Landing').toString()
        });
    }
    var redirectUrl = URLUtils.https('HearingTest-LifestyleForm').toString();
    var methodType = 'post';
    var csrfToken = '';
    if (customer.authenticated) {
        var apiCsrfProtection = require('dw/web/CSRFProtection');
        csrfToken = apiCsrfProtection.generateToken();
        redirectUrl = URLUtils.https('HearingTest-Results').toString();
        methodType = 'get';
    }

    res.json({
        success: true,
        methodType: methodType,
        redirectUrl: redirectUrl,
        csrfToken: csrfToken
    });
    next();
});

/**
 * HearingTest-LifestyleForm : This endpoint will display the for the guest user
 * @name Base/HearingTest-LifestyleForm
 * @function
 * @memberof HearingTest
 * @param {middleware} - server.middleware.https
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('LifestyleForm', server.middleware.https, csrfProtection.generateToken, function (req, res, next) {
    var URLUtils = require('dw/web/URLUtils');
    var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
    if (req.pageMetaData.title === currentSitePipeline) {
        var nameObj = JSON.parse(preferences.pageMetaTitle);
        var title = {};
        title.pageTitle = nameObj['HearingTest-LifestyleForm'] ? nameObj['HearingTest-LifestyleForm'].pageTitle : currentSitePipeline;
        pageMetaHelper.setPageMetaData(req.pageMetaData, title);
    }
    res.render('hearingtest/lifestyleQuestionsGuestForm', {
        stage: Resource.msg('lifestyle.stage.3', 'hearingtest', null),
        actionUrl: URLUtils.abs('HearingTest-Results').toString()
    });
    next();
}, pageMetaData.computedPageMetaData);

/**
 * HearingTest-Results : This endpoint will display the result based on the input
 * @name Base/HearingTest-Results
 * @function
 * @memberof HearingTest
 * @param {middleware} - server.middleware.https
 * @param {renders} - isml
 * @param {serverfunction} - post
 */
server.post('Results', server.middleware.https, csrfProtection.validateRequest, function (req, res, next) {
    var CustomObjectMgr = require('dw/object/CustomObjectMgr');
    var getLeadSvc = require('*/cartridge/scripts/services/GetLeadService.js');
    var createLeadSvc = require('*/cartridge/scripts/services/CreateLeadService.js');
    var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
    if (req.pageMetaData.title === currentSitePipeline) {
        var nameObj = JSON.parse(preferences.pageMetaTitle);
        var title = {};
        title.pageTitle = nameObj['HearingTest-Results'] ? nameObj['HearingTest-Results'].pageTitle : currentSitePipeline;
        pageMetaHelper.setPageMetaData(req.pageMetaData, title);
    }
    var currentCustomer = req.currentCustomer.raw;
    var requestObject;
    // Forming the customer data into request object
    if (currentCustomer.profile) {
        var profile = currentCustomer.profile;
        requestObject = {
            lastName: profile.lastName,
            firstName: profile.firstName,
            dob: session.privacy.profilebirthdate || '',
            phone: profile.phoneHome,
            email: profile.email,
            isAuthenticated: !!customer.profile,
            sfcccontactId: 'sfdcContactID' in profile.custom ? profile.custom.sfdcContactID : null,
            type: 'create'
        };
    } else {
        var customerData = req.form;
        requestObject = {
            lastName: customerData.lifestyleLastName,
            firstName: customerData.lifestyleFirstName,
            email: customerData.lifestyleEmail,
            isAuthenticated: !!customer.profile,
            type: 'create'
        };
    }
    // Updating request Object with the questions
    var resultId = session.custom.resultId;
    var lifeStyleQuestionare = CustomObjectMgr.getCustomObject('LifestyleAnswer', resultId);
    if (lifeStyleQuestionare) {
        var selectedLifestyleAnswer = lifeStyleQuestionare.custom.questionAnswers;
        var questAnswers = [];
        if (selectedLifestyleAnswer) {
            var answersObject;
            try {
                answersObject = JSON.parse(JSON.parse(selectedLifestyleAnswer).questions);
                for (var i = 0; i < answersObject.length; i++) {
                    questAnswers.push({ quest: answersObject[i].answer });
                }
            } catch (e) {
                questAnswers = [];
            }
        }
        if (questAnswers.length > 0) {
            requestObject.questAnswer1 = questAnswers[0].quest;
            requestObject.questAnswer2 = questAnswers[1].quest;
            var questAnswer3 = questAnswers[2].quest ? questAnswers[2].quest.split('|') : [];
            requestObject.questAnswer3 = {
                option1: questAnswer3[0],
                option2: questAnswer3[1],
                option3: questAnswer3[2],
                option4: questAnswer3[3]
            };
        }
    }

    var testResults;
    // eslint-disable-next-line no-unused-vars
    var leadResponse;
    if (resultId) {
        var leadResult = getLeadSvc.call(session.custom.resultId, false);
        if (leadResult.error === 401) {
            leadResult = getLeadSvc.call(session.custom.resultId, true);
        }
        if (leadResult.ok && leadResult.object && leadResult.object.response.isSuccess) {
            requestObject.type = 'update';
            requestObject.form = 'hearing';
            requestObject.resultId = session.custom.resultId;
            session.custom.hearingresult = 'result' in leadResult.object.response && leadResult.object.response.result ? leadResult.object.response.result.toString().toLowerCase() : '';
            leadResponse = createLeadSvc.call(requestObject, false);
            if (leadResponse.error === 401) {
                leadResponse = createLeadSvc.call(requestObject, true);
            }
        } else {
            leadResponse = createLeadSvc.call(requestObject, false);
            if (leadResponse.error === 401) {
                leadResponse = createLeadSvc.call(requestObject, true);
            }
        }
    } else {
        leadResponse = createLeadSvc.call(requestObject, false);
        if (leadResponse.error === 401) {
            leadResponse = createLeadSvc.call(requestObject, true);
        }
    }
    if (leadResponse.ok && leadResponse.object && leadResponse.object.response.isSuccess) {
        var contactObj = {
            FirstName: requestObject.firstName,
            heaingloss: session.custom.hearingresult
        };
        // Sending Mail
        var emailHelpers = require('*/cartridge/scripts/helpers/emailHelpers');
        var emailObj = {
            to: requestObject.email,
            subject: Resource.msg('subject.contactus.email', 'contactUs', null),
            from: preferences.customerSvcMail || 'no-reply@salesforce.com',
            type: emailHelpers.emailTypes.hearingTest
        };

        emailHelpers.sendEmail(emailObj, null, contactObj);
    }

    res.render('hearingtest/results', {
        stage: Resource.msg('lifestyle.stage.4', 'hearingtest', null),
        testResults: testResults
    });
    next();
}, pageMetaData.computedPageMetaData);

/**
 * HearingTest-UploadFile : This endpoint will display the Form for uploading hearing test
 * @name Base/HearingTest-UploadFile
 * @function
 * @memberof HearingTest
 * @param {middleware} - server.middleware.https
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('UploadFile', server.middleware.https, csrfProtection.generateToken, function (req, res, next) {
    var URLUtils = require('dw/web/URLUtils');
    var StringUtils = require('dw/util/StringUtils');
    var Calendar = require('dw/util/Calendar');
    var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
    if (req.pageMetaData.title === currentSitePipeline) {
        var nameObj = JSON.parse(preferences.pageMetaTitle);
        var title = {};
        title.pageTitle = nameObj['HearingTest-UploadFile'] ? nameObj['HearingTest-UploadFile'].pageTitle : currentSitePipeline;
        pageMetaHelper.setPageMetaData(req.pageMetaData, title);
    }
    res.render('hearingtest/hearingTestFileUpload', {
        actionUrl: URLUtils.url('HearingTest-Upload').toString(),
        maxDate: StringUtils.formatCalendar(new Calendar(new Date()), 'yyyy-MM-dd'),
        recaptchaKey: preferences.recaptchaSiteKey,
        recaptchaEnable: preferences.enableRecaptcha,
        authenticated: !!req.currentCustomer.profile,
        allowedTypes: preferences.allowedFileTypes,
        allowedFileLength: preferences.allowedFileLength,
        oauthLoginTargetEndPoint: 5
    });
    next();
}, pageMetaData.computedPageMetaData);

/**
 * HearingTest-Upload : This will call Apex call to upload the document to SF Ease
 * @name Base/HearingTest-Upload
 * @function
 * @memberof HearingTest
 * @param {middleware} - server.middleware.https
 * @param {renders} - json
 * @param {serverfunction} - post
 */
server.post('Upload', server.middleware.https, function (req, res, next) {
    var StringUtils = require('dw/util/StringUtils');
    var Calendar = require('dw/util/Calendar');
    var URLUtils = require('dw/web/URLUtils');
    var createLeadSvc = require('*/cartridge/scripts/services/CreateLeadService.js');
    var captchaVerifySVC = require('*/cartridge/scripts/services/RecaptchaVerify.js');
    var verifyCaptcha = true;
    var allowedTypes = preferences.allowedFileTypes;
    var File = require('dw/io/File');
    var hearingTestHelpers = require('*/cartridge/scripts/helpers/hearingtestHelpers.js');

    var params = request.httpParameterMap;
    var formObj = req.form;
    var file = '';
    var fileName;
    var fileType;

    var closure = function (field, ct, oname) {
        fileName = oname;
        fileType = ct;
        file = new File(File.TEMP + '/' + oname);
        return file;
    };

    params.processMultipart(closure);
    var fileBody = hearingTestHelpers.processFile(file.fullPath);

    try {
        if (!empty(file)) {
            var fileNameRev = fileName.split('.').reverse();
            var fileExt = '.' + (fileNameRev[0]).toLowerCase();
            var allowedfileTypes = (allowedTypes.toString()).toLowerCase();
            var isAllowed = allowedfileTypes.includes(fileExt);
            if (!isAllowed) {
                res.json({
                    error: true,
                    formatError: true,
                    msg: Resource.msg('error.msg.unsupported-file-format', 'hearingtest', null)
                });
                return next();
            }

            // removing file since we have generated the filedata and the file is no more needed in TEMP folder.
            file.remove();

            var contactData = formObj;
            if (preferences.enableRecaptcha) {
                var captchaResponse = contactData['g-recaptcha-response'];
                // Validating if user has checked the recaptcha

                if (empty(captchaResponse)) {
                    res.json({
                        error: true,
                        captchaError: true,
                        msg: Resource.msg('text.captcha.error', 'contactUs', null)
                    });
                    return next();
                }
                var captchaService = captchaVerifySVC.call(captchaResponse);
                verifyCaptcha = captchaService.object.success ? captchaService.object.success : false;
            }

            var currentCustomer = req.currentCustomer.profile ? req.currentCustomer.raw.profile : null;
            if (verifyCaptcha) {
                var contactInfo = {
                    lastName: currentCustomer ? currentCustomer.lastName : contactData.userLastName,
                    firstName: currentCustomer ? currentCustomer.firstName : contactData.userFirstName,
                    dob: currentCustomer && session.privacy.profilebirthdate ? session.privacy.profilebirthdate : contactData.userDob,
                    street: contactData.userStreet,
                    state: contactData.userState,
                    city: contactData.userCity,
                    zipCode: contactData.userZipCode,
                    phone: currentCustomer && currentCustomer.phoneHome ? currentCustomer.phoneHome : contactData.userPhone,
                    email: currentCustomer ? currentCustomer.email : contactData.userEmail,
                    isAuthenticated: !!req.currentCustomer.profile,
                    sfcccontactId: currentCustomer && 'sfdcContactID' in currentCustomer.custom ? currentCustomer.custom.sfdcContactID : '',
                    form: 'upload',
                    documentName: fileName,
                    fileType: fileType,
                    documentType: 'Med Medical Records',
                    healthPlanInsurer: currentCustomer && session.privacy.customerDetails ? JSON.parse(session.privacy.customerDetails).insuracePlan_Id : contactData.healthPlanInsurerId,
                    healthPlanMemberID: currentCustomer && session.privacy.subscriberId ? session.privacy.subscriberId : contactData.healthPlanMemberId,
                    earMoldUser: contactData.isEarMoldUser,
                    previoushearingUser: contactData.isHearingAidUser,
                    fileBody: fileBody
                };
                var response = createLeadSvc.call(contactInfo, false);
                if (response.error === 401) {
                    response = createLeadSvc.call(contactInfo, true);
                }
                if (response.ok && response.object && response.object.response.isSuccess) {
                    session.privacy.hearingTestDate = StringUtils.formatCalendar(new Calendar(new Date()), 'yyyy-MM-dd');
                    res.json({
                        success: true,
                        redirectURL: URLUtils.url('HearingTest-Confirm').toString()
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
                            msg: Resource.msg('subscribe.to.contact.us.service.invalid', 'contactUs', null)
                        });
                    }
                }
            } else {
                res.json({
                    error: true,
                    captchaError: true,
                    msg: Resource.msg('text.captcha.error', 'contactUs', null)
                });
            }
        } else {
            res.json({
                error: true,
                msg: Resource.msg('text.error.fileupload', 'hearingtest', null)
            });
        }
    } catch (e) {
        res.json({
            error: true,
            msg: e
        });
    }
    return next();
});

/**
 * HearingTest-Confirm : This endpoint will display the confirmation page based on the upload form
 * @name Base/HearingTest-Confirm
 * @function
 * @memberof HearingTest
 * @param {middleware} - server.middleware.https
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('Confirm', server.middleware.https, function (req, res, next) {
    var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
    if (req.pageMetaData.title === currentSitePipeline) {
        var nameObj = JSON.parse(preferences.pageMetaTitle);
        var title = {};
        title.pageTitle = nameObj['HearingTest-Confirm'] ? nameObj['HearingTest-Confirm'].pageTitle : currentSitePipeline;
        pageMetaHelper.setPageMetaData(req.pageMetaData, title);
    }
    res.render('hearingtest/hearingTestConfirmation');
    next();
}, pageMetaData.computedPageMetaData);

module.exports = server.exports();
