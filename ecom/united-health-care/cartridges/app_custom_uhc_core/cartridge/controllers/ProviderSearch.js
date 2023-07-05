'use strict';

var server = require('server');
var providerSearchSvc = require('*/cartridge/scripts/services/ProviderSearchService');
var preferences = require('*/cartridge/config/preferences.js');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var pageMetaData = require('*/cartridge/scripts/middleware/pageMetaData');
var Site = require('dw/system/Site');
var currentSiteID = Site.current.ID;
var currentSitePipeline = 'Sites-' + currentSiteID + '-Site';

/**
 * ProviderSearch-Show : This endpoint is called to load Provider Search landing Page
 * @name Base/ProviderSearch-Show
 * @function
 * @memberof ProviderSearch
 * @param {middleware} - server.middleware.https
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('Show', server.middleware.https, function (req, res, next) {
    var URLUtils = require('dw/web/URLUtils');
    var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
    if (req.pageMetaData.title === currentSitePipeline) {
        var nameObj = JSON.parse(preferences.pageMetaTitle);
        var title = {};
        title.pageTitle = nameObj['ProviderSearch-Show'] ? nameObj['ProviderSearch-Show'].pageTitle : currentSitePipeline;
        pageMetaHelper.setPageMetaData(req.pageMetaData, title);
    }
    var isDisplayForm = false;
    if (customer.authenticated) {
        isDisplayForm = true;
    } else if (req.querystring.providerType === 'guest') {
        isDisplayForm = true;
    }

    var searchForm = server.forms.getForm('searchForm');
    searchForm.clear();
    var actionURL = URLUtils.url('ProviderSearch-Submit').toString();
    res.render('/providerSearch/providerSearchLanding', {
        isDisplayForm: isDisplayForm,
        searchForm: searchForm,
        actionURL: actionURL,
        radiusValues: preferences.providerSearchRadius,
        oauthLoginTargetEndPoint: 3
    });
    next();
}, pageMetaData.computedPageMetaData);

/**
 * ProviderSearch-Submit : This endpoint is form post call when user searches with zipCode as input
 * @name Base/ProviderSearch-Show
 * @function
 * @memberof ProviderSearch
 * @param {middleware} - server.middleware.https
 * @param {renders} - isml/json
 * @param {serverfunction} - post
 */
server.post('Submit', server.middleware.https, csrfProtection.generateToken, function (req, res, next) {
    var searchForm = server.forms.getForm('searchForm');
    var zipCode = searchForm.zipCode.value;
    var radius = searchForm.radius.value;
    var stateCode = searchForm.stateCode.htmlValue;
    var providerType = searchForm.providerType.value;
    var URLUtils = require('dw/web/URLUtils');
    var Resource = require('dw/web/Resource');
    var StringUtils = require('dw/util/StringUtils');
    var Calendar = require('dw/util/Calendar');
    var utilHelpers = require('*/cartridge/scripts/helpers/utilHelpers');
    var mapURL = utilHelpers.getGoogleMapsApi(preferences.googleMapAPIkey);
    var maxDate = StringUtils.formatCalendar(new Calendar(new Date()), 'yyyy-MM-dd');
    var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
    var nameObj = JSON.parse(preferences.pageMetaTitle);
    var allowedTypes = preferences.allowedFileTypes;
    var allowedFileLength = preferences.allowedFileLength;
    var title = {};

    var profile = {};
    if (req.currentCustomer.profile) {
        profile.fname = req.currentCustomer.profile.firstName;
        profile.lname = req.currentCustomer.profile.lastName;
        profile.email = req.currentCustomer.profile.email;
    }
    if (session.privacy.customerDetails) {
        try {
            profile.healthPlanInsurer = JSON.parse(session.privacy.customerDetails).Insurer;
            profile.healthPlanMemberID = session.privacy.subscriberId;
        } catch (e) {
            profile.healthPlanInsurer = '';
            profile.healthPlanMemberID = '';
        }
    }
    if (!providerType || providerType === 'In-Person') {
        var response = providerSearchSvc.call(zipCode, radius, stateCode, false);
        if (response.error === 401) {
            response = providerSearchSvc.call(zipCode, radius, stateCode, true);
        }
        if (response.ok && response.object && response.object.practices) {
            var restrictedBrands = preferences.restrictedBrands;
            if (restrictedBrands.length > 0) {
                restrictedBrands = restrictedBrands.map(function (restrictedbrand) {
                    return restrictedbrand.toLowerCase();
                });
            }

            var responseObj = response.object.practices;
            if (preferences.restrictedPracticeIDs && preferences.restrictedPracticeIDs.length > 0) {
                var nonRestrictedPracticeIDs = responseObj.filter(function (robj) {
                    return preferences.restrictedPracticeIDs.indexOf(robj.practiceId) === -1;
                });
                responseObj = responseObj.filter(function (pobj) {
                    return nonRestrictedPracticeIDs.indexOf(pobj) === -1;
                });
                responseObj = nonRestrictedPracticeIDs;
            }
            if (responseObj.length > 0) {
                // Sorted by the distance of the practices
                if (preferences.enableSorting) {
                    responseObj = responseObj.sort(function (practice1, practice2) {
                        return practice1.distance - practice2.distance;
                    });
                }

                if (restrictedBrands.length > 0) {
                    responseObj.forEach(function (obj) {
                        if (obj.brand.length > 0) {
                            // eslint-disable-next-line no-param-reassign
                            obj.brand = obj.brand.filter(function (brand) {
                                return restrictedBrands.indexOf(brand.toLowerCase()) < 0;
                            });
                        }
                    });
                }
            }
            var specialities = {
                Audiologist: Resource.msg('label.speciality.audiologist', 'providersearch', null),
                AuD: Resource.msg('label.speciality.AuD', 'providersearch', null),
                'D (Dispenser)': Resource.msg('label.speciality.D', 'providersearch', null),
                'E (ENT)': Resource.msg('label.speciality.E', 'providersearch', null)
            };

            try {
                title.pageTitle = nameObj['ProviderSearch-Results'] ? nameObj['ProviderSearch-Results'].pageTitle : currentSitePipeline;
                pageMetaHelper.setPageMetaData(req.pageMetaData, title);
                res.render('/providerSearch/providerSearchResult', {
                    providerResult: {
                        practices: responseObj
                    },
                    specialities: specialities,
                    isAuthenticated: !!req.currentCustomer.profile,
                    mapURL: mapURL,
                    isVirtual: false,
                    searchForm: searchForm,
                    radiusValues: preferences.providerSearchRadius,
                    requestAppointment: false,
                    zipCode: zipCode,
                    maxDate: maxDate,
                    profile: profile,
                    searchActionURL: URLUtils.url('ProviderSearch-Submit').toString(),
                    actionUrl: URLUtils.abs('ProviderSearch-RequestAppointmentSubmit').toString()
                });
            } catch (e) {
                res.json({
                    error: true,
                    msg: e
                });
            }
        } else {
            title.pageTitle = nameObj['ProviderSearch-noResults'] ? nameObj['ProviderSearch-noResults'].pageTitle : currentSitePipeline;
            pageMetaHelper.setPageMetaData(req.pageMetaData, title);
            res.render('providerSearch/noResultsFound', {
                mapURL: mapURL,
                searchActionURL: URLUtils.url('ProviderSearch-Submit').toString(),
                searchForm: searchForm,
                radiusValues: preferences.providerSearchRadius
            });
        }
    } else {
        title.pageTitle = nameObj['ProviderSearch-Submit'] ? nameObj['ProviderSearch-Submit'].pageTitle : currentSitePipeline;
        pageMetaHelper.setPageMetaData(req.pageMetaData, title);
        res.render('/providerSearch/providerSearchResult', {
            isAuthenticated: !!req.currentCustomer.profile,
            isVirtual: true,
            requestAppointment: false,
            zipCode: zipCode,
            profile: profile,
            maxDate: maxDate,
            allowedTypes: allowedTypes,
            allowedFileLength: allowedFileLength,
            actionUrl: URLUtils.abs('ProviderSearch-RequestAppointmentSubmit').toString()
        });
    }

    next();
}, pageMetaData.computedPageMetaData);

/**
 * ProviderSearch-RequestAppointmentSubmit : This endpoint will submit the request for appointment to SF Ease
 * @name Base/ProviderSearch-RequestAppointmentSubmit
 * @function
 * @memberof ProviderSearch
 * @param {middleware} - server.middleware.https
 * @param {renders} - isml/json
 * @param {serverfunction} - post
 */
server.post('RequestAppointmentSubmit', server.middleware.https, csrfProtection.validateAjaxRequest, csrfProtection.generateToken, function (req, res, next) {
    var createLeadSvc = require('*/cartridge/scripts/services/CreateLeadService.js');
    var appointmentForm = req.form;
    var searchForm = server.forms.getForm('searchForm');
    var zipCode = searchForm.zipCode.value;
    var customer = req.currentCustomer.profile ? req.currentCustomer.raw : null;
    var profile = customer ? customer.profile : null;
    var Resource = require('dw/web/Resource');
    var URLUtils = require('dw/web/URLUtils');
    var StringUtils = require('dw/util/StringUtils');
    var Calendar = require('dw/util/Calendar');
    var error;
    var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
    if (req.pageMetaData.title === currentSitePipeline) {
        var nameObj = JSON.parse(preferences.pageMetaTitle);
        var title = {};
        title.pageTitle = nameObj['ProviderSearch-RequestAppointmentSubmit'] ? nameObj['ProviderSearch-RequestAppointmentSubmit'].pageTitle : currentSitePipeline;
        pageMetaHelper.setPageMetaData(req.pageMetaData, title);
    }

    var contactInfo = {
        lastName: profile ? profile.lastName : appointmentForm.contactLastName,
        firstName: profile ? profile.firstName : appointmentForm.contactFirstName,
        dob: session.privacy.profilebirthdate || StringUtils.formatCalendar(new Calendar(new Date(appointmentForm.contactDob)), 'yyyy-MM-dd'),
        zipCode: zipCode,
        // eslint-disable-next-line no-nested-ternary
        phone: appointmentForm.contactPhone,
        street: appointmentForm.contactStreet,
        state: appointmentForm.contactState,
        city: appointmentForm.contactCity,
        visittype: searchForm.providerType.value,
        email: profile ? profile.email : appointmentForm.contactEmail,
        isAuthenticated: !!profile,
        practiceId: appointmentForm.practiceId || '',
        healthPlanInsurer: appointmentForm.healthPlanInsurerId,
        healthPlanMemberId: appointmentForm.healthPlanMemberId,
        otherInsurer: appointmentForm.otherInsurer,
        sfcccontactId: profile && 'sfdcContactID' in profile.custom ? profile.custom.sfdcContactID : null,
        form: 'appointment',
        AARPMemberId: appointmentForm.aarpMembershipId,
        hearingTestQuestion: appointmentForm.hearingTestQuestion
    };
    if (appointmentForm && appointmentForm.hearingTestQuestion === 'yes') {
        // hearing test file upload code
        var File = require('dw/io/File');
        var hearingTestHelpers = require('*/cartridge/scripts/helpers/hearingtestHelpers.js');

        var params = request.httpParameterMap;
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
        if (!empty(file) && file.file) {
            var fileBody = hearingTestHelpers.processFile(file.fullPath);

            // removing file since we have generated the filedata and the file is no more needed in TEMP folder.
            file.remove();

            contactInfo = {
                lastName: profile ? profile.lastName : appointmentForm.contactLastName,
                firstName: profile ? profile.firstName : appointmentForm.contactFirstName,
                dob: session.privacy.profilebirthdate || StringUtils.formatCalendar(new Calendar(new Date(appointmentForm.contactDob)), 'yyyy-MM-dd'),
                zipCode: zipCode,
                // eslint-disable-next-line no-nested-ternary
                phone: appointmentForm.contactPhone,
                street: appointmentForm.contactStreet,
                state: appointmentForm.contactState,
                city: appointmentForm.contactCity,
                visittype: searchForm.providerType.value,
                email: profile ? profile.email : appointmentForm.contactEmail,
                isAuthenticated: !!profile,
                practiceId: appointmentForm.practiceId || '',
                healthPlanInsurer: appointmentForm.healthPlanInsurerId,
                healthPlanMemberId: appointmentForm.healthPlanMemberId,
                otherInsurer: appointmentForm.otherInsurer,
                sfcccontactId: profile && 'sfdcContactID' in profile.custom ? profile.custom.sfdcContactID : null,
                form: 'appointment',
                AARPMemberId: appointmentForm.aarpMembershipId,
                hearingTestQuestion: appointmentForm.hearingTestQuestion,
                documentName: fileName,
                fileType: fileType,
                documentType: 'Med Medical Records',
                fileBody: fileBody
            };
        }
    }
    var response = createLeadSvc.call(contactInfo);

    // If it is success then we are re-directing to Confirmation page else displaying an error
    if (response.ok && response.object && response.object.response.isSuccess) {
        var contactObj = {
            FirstName: profile ? profile.firstName : appointmentForm.contactFirstName
        };
        // Sending Mail
        var emailHelpers = require('*/cartridge/scripts/helpers/emailHelpers');
        var emailObj = {
            to: profile ? profile.email : appointmentForm.contactEmail,
            subject: Resource.msg('subject.contactus.email', 'contactUs', null),
            from: preferences.customerSvcMail || 'no-reply@salesforce.com',
            type: emailHelpers.emailTypes.appointmentRequest
        };

        emailHelpers.sendEmail(emailObj, null, contactObj);
        res.render('providerSearch/providerSearchConfirmation');
    } else {
        var errMessage = response.object ? response.object.errMessage : null;
        if (errMessage) {
            var providerSeachHelper = require('*/cartridge/scripts/helpers/providerSearchHelpers');
            error = providerSeachHelper.getErrorMessage(errMessage);
        } else {
            error = Resource.msg('error.submit.appointment.api', 'providersearch', null);
        }
        try {
            res.render('/providerSearch/providerSearchResult', {
                isAuthenticated: !!req.currentCustomer.profile,
                isVirtual: true,
                isError: error,
                actionUrl: URLUtils.abs('ProviderSearch-RequestAppointmentSubmit').toString()
            });
        } catch (e) {
            res.json({
                error: true,
                msg: e
            });
        }
    }
    next();
}, pageMetaData.computedPageMetaData);

/**
 * ProviderSearch-RequestAppointmentAuthForm : This endpoint will show the request appointment form with prefilled values
 * @name Base/ProviderSearch-RequestAppointmentAuthForm
 * @function
 * @memberof ProviderSearch
 * @param {middleware} - server.middleware.https
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('RequestAppointmentAuthForm', server.middleware.https, csrfProtection.generateToken, function (req, res, next) {
    var URLUtils = require('dw/web/URLUtils');
    var address = req.querystring.address;
    var searchForm = server.forms.getForm('searchForm');
    var zipCode = searchForm.zipCode.value;
    var radius = searchForm.radius.value;
    var stateCode = searchForm.stateCode.htmlValue;
    var practiceId = req.querystring.practiceId;
    var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
    if (req.pageMetaData.title === currentSitePipeline) {
        var nameObj = JSON.parse(preferences.pageMetaTitle);
        var title = {};
        title.pageTitle = nameObj['ProviderSearch-RequestAppointmentAuthForm'] ? nameObj['ProviderSearch-RequestAppointmentAuthForm'].pageTitle : currentSitePipeline;
        pageMetaHelper.setPageMetaData(req.pageMetaData, title);
    }
    var profile = {};
    if (req.currentCustomer.profile) {
        profile.fname = req.currentCustomer.profile.firstName;
        profile.lname = req.currentCustomer.profile.lastName;
        profile.email = req.currentCustomer.profile.email;
    }
    if (session.privacy.customerDetails) {
        try {
            profile.healthPlanInsurer = JSON.parse(session.privacy.customerDetails).Insurer;
            profile.healthPlanMemberID = session.privacy.subscriberId;
        } catch (e) {
            profile.healthPlanInsurer = '';
            profile.healthPlanMemberID = '';
        }
    }
    var utilHelpers = require('*/cartridge/scripts/helpers/utilHelpers');
    var mapURL = utilHelpers.getGoogleMapsApi(preferences.googleMapAPIkey);
    var response = providerSearchSvc.call(zipCode, radius, stateCode);
    if (response.ok && response.object && response.object.practices) {
        var responseObj = response.object.practices;
        res.render('/providerSearch/authenticatedRequestAppointmentForm',
            {
                profile: profile,
                address: address,
                zipCode: zipCode,
                radius: radius,
                stateCode: stateCode,
                searchForm: searchForm,
                radiusValues: preferences.providerSearchRadius,
                providerResult: {
                    practices: responseObj
                },
                practiceId: practiceId,
                searchActionURL: URLUtils.url('ProviderSearch-Submit').toString(),
                actionUrl: URLUtils.abs('ProviderSearch-RequestAppointmentSubmit').toString(),
                isAuthenticated: !!req.currentCustomer.profile,
                mapURL: mapURL
            });
    } else {
        // TO DO
    }

    next();
});

module.exports = server.exports();
