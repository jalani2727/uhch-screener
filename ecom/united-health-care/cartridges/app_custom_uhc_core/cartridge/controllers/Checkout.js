'use strict';

/**
 * @namespace Checkout
 */

var server = require('server');
server.extend(module.superModule);
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var Site = require('dw/system/Site');

/**
 * Checkout-Begin : The Checkout-Begin endpoint will render the checkout shipping page for both guest shopper and returning shopper
 * @name Base/Checkout-Begin
 * @function
 * @memberof Checkout
 * @param {middleware} - server.middleware.https
 * @param {middleware} - consentTracking.consent
 * @param {middleware} - csrfProtection.generateToken
 * @param {querystringparameter} - stage - a flag indicates the checkout stage
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.prepend(
    'Begin',
    function (req, res, next) {
        var BasketMgr = require('dw/order/BasketMgr');
        var URLUtils = require('dw/web/URLUtils');
        var cartHelper = require('*/cartridge/scripts/cart/cartHelpers');
        var currentBasket = BasketMgr.getCurrentBasket();
        if (currentBasket && currentBasket.allProductLineItems.length > 0) {
            var result = cartHelper.validateCart(currentBasket.allProductLineItems.toArray());
            if (result.isExceeding || result.isDuplicate || result.isExceedingOTC || result.isOTCPrescription || result.isMultiplePrescription) {
                res.redirect(URLUtils.url('Cart-Show'));
                return next();
            }
        }
        // eslint-disable-next-line consistent-return
        return next();
    }
);

/**
 * Checkout-Begin : The Checkout-Begin endpoint will render the checkout page upload hearing test section for logged in user
 * @name Base/Checkout-Begin
 * @function
 * @memberof Checkout
 * @param {middleware} - server.middleware.https
 * @param {middleware} - consentTracking.consent
 * @param {middleware} - csrfProtection.generateToken
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.append(
    'Begin',
    function (req, res, next) {
        var currentSiteID = Site.current.ID;
        var currentSitePipeline = 'Sites-' + currentSiteID + '-Site';
        var viewData = res.getViewData();
        var preferences = require('*/cartridge/config/preferences.js');
        var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
        if (req.pageMetaData.title === currentSitePipeline) {
            var nameObj = JSON.parse(preferences.pageMetaTitle);
            var title = {};
            title.pageTitle = nameObj['Checkout-Begin'] ? nameObj['Checkout-Begin'].pageTitle : currentSitePipeline;
            pageMetaHelper.setPageMetaData(req.pageMetaData, title);
        }
        var isTraditionalProductEnabled = preferences.enableTraditionalProduct;
        var currentStage = viewData.currentStage;
        if ((req.currentCustomer.profile || currentStage === 'shipping' || currentStage === 'uploadHearingTest') && isTraditionalProductEnabled) {
            var BasketMgr = require('dw/order/BasketMgr');
            var currentBasket = BasketMgr.getCurrentBasket();
            var isTraditional = false;
            if (currentBasket && currentBasket.allProductLineItems.length > 0) {
                var lineItems = currentBasket.allProductLineItems.toArray();
                lineItems.forEach(function myFunction(item) {
                    if (item.product.custom.isPrescriptionProduct) {
                        isTraditional = true;
                    }
                });
            }
            if (isTraditional) {
                var currentCustomer = req.currentCustomer.profile;
                viewData = {
                    currentStage: 'uploadHearingTest',
                    allowedTypes: preferences.allowedFileTypes,
                    allowedFileLength: preferences.allowedFileLength,
                    dataUploadHearingTestEnabled: true,
                    userFirstName: currentCustomer.firstName
                };
                res.setViewData(viewData);
            }
        }

        // eslint-disable-next-line consistent-return
        return next();
    }
);

/**
 * Checkout-UploadHearingTest : This will call Apex call to upload the document to SF Ease
 * @name Base/Checkout-UploadHearingTest
 * @function
 * @memberof Checkout
 * @param {middleware} - server.middleware.https
 * @param {renders} - json
 * @param {serverfunction} - post
 */
server.post('UploadHearingTest', server.middleware.https, csrfProtection.validateAjaxRequest, function (req, res, next) {
    var createLeadSvc = require('*/cartridge/scripts/services/CreateLeadService.js');
    var StringUtils = require('dw/util/StringUtils');
    var Calendar = require('dw/util/Calendar');
    try {
        if (!empty(req.form.file)) {
            var file = JSON.parse(req.form.file);
            var currentCustomer = req.currentCustomer.profile ? req.currentCustomer.raw.profile : null;
            var contactInfo = {
                lastName: currentCustomer ? currentCustomer.lastName : '',
                firstName: currentCustomer ? currentCustomer.firstName : '',
                dob: currentCustomer && session.privacy.profilebirthdate ? session.privacy.profilebirthdate : '',
                street: '',
                state: '',
                city: '',
                zipCode: '',
                phone: currentCustomer && currentCustomer.phoneHome ? currentCustomer.phoneHome : '',
                email: currentCustomer ? currentCustomer.email : '',
                isAuthenticated: !!req.currentCustomer.profile,
                sfcccontactId: currentCustomer && 'sfdcContactID' in currentCustomer.custom ? currentCustomer.custom.sfdcContactID : '',
                form: 'upload',
                documentName: file.fileName,
                fileType: file.fileType,
                documentType: 'Med Medical Records',
                healthPlanInsurer: currentCustomer && session.privacy.customerDetails ? JSON.parse(session.privacy.customerDetails).insuracePlan_Id : '',
                healthPlanMemberID: currentCustomer && session.privacy.subscriberId ? session.privacy.subscriberId : '',
                earMoldUser: '',
                previoushearingUser: '',
                fileBody: file.fileBody
            };
            var response = createLeadSvc.call(contactInfo, false);
            if (response.error === 401) {
                response = createLeadSvc.call(contactInfo, true);
            }
            if (response.ok) {
                session.privacy.hearingTestDate = StringUtils.formatCalendar(new Calendar(new Date()), 'yyyy-MM-dd');
                res.json({
                    success: true
                });
            } else {
                res.json({
                    error: true
                });
            }
        } else {
            res.json({
                error: true
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

module.exports = server.exports();
