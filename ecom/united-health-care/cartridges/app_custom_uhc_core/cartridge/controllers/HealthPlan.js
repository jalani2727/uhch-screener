'use strict';

/**
 * @namespace HealthPlan
 */

var server = require('server');

/**
 * HealthPlan-Check :
 * @name Base/HealthPlan-Check
 * @function
 * @memberof HealthPlan
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('Check', function (req, res, next) {
    var preferences = require('*/cartridge/config/preferences.js');
    if (preferences.enableHeathPlan) {
        var ishealthPlanModelDisplayed = req.session.privacyCache.get('healthPlanModelViewed');
        var showmodel = customer.authenticated && (session.privacy.subscriberId === 'undefined' || !session.privacy.subscriberId) && !ishealthPlanModelDisplayed;
        res.render('/healthplan/healthplanCheck', {
            showmodel: showmodel
        });
    }
    next();
});

/**
 * HealthPlan-SetPlan :
 * @name Base/HealthPlan-SetPlan
 * @function
 * @memberof HealthPlan
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('SetPlan', function (req, res, next) {
    var healthplan = (req.querystring.healthplan === 'true');
    if (healthplan) {
        var URLUtils = require('dw/web/URLUtils');
        var actionURL = URLUtils.url('HealthPlan-HealthPlanSubmit').toString();
        res.render('/healthplan/healthplanForm', {
            actionURL: actionURL
        });
    } else {
        req.session.privacyCache.set('healthPlanModelViewed', true);
        res.json({ success: 'close' });
    }
    next();
});

/**
 * HealthPlan-HealthPlanSubmit :
 * @name Base/HealthPlan-HealthPlanSubmit
 * @function
 * @memberof HealthPlan
 * @param {renders} - isml
 * @param {serverfunction} - post
 */
server.post('HealthPlanSubmit', function (req, res, next) {
    var Resource = require('dw/web/Resource');
    var eligibilityHelper = require('*/cartridge/scripts/helpers/eligibilityHelper');
    var confirmationMessage = '';
    var buttonName = Resource.msg('hearingplan.confirmation.pricing.continue.button', 'hearingplan', null);
    var buttonURL = '';

    var currentCustomer = req.currentCustomer.profile;
    var externalProfile = {};
    externalProfile.subscriberId = req.form.healthPlanMemberID;
    externalProfile.lastName = req.form.healthPlanLastName;
    externalProfile.firstName = req.form.healthPlanFirstName;
    externalProfile.email = currentCustomer.email;
    externalProfile.requestSource = 'healthPlanCheck';

    eligibilityHelper.getCustomerDetails(externalProfile);
    // 1 if pricebook is not null
    if (session.privacy.pricebook && session.privacy.pricebook !== null) {
        // updating the pricebook if it is avaiable in the session
        eligibilityHelper.updatePriceBook();
        confirmationMessage = Resource.msg('hearingplan.confirmation.pricing.body', 'hearingplan', null);
    } else {
        // 2 if no pricebook
        confirmationMessage = Resource.msg('hearingplan.confirmation.nopricing.body', 'hearingplan', null);
    }
    // 3 if medup detail is still is discussion
    req.session.privacyCache.set('healthPlanModelViewed', true);
    res.render('/healthplan/healthplanSuccess', {
        confirmationMessage: confirmationMessage,
        buttonName: buttonName,
        buttonURL: buttonURL
    });
    next();
});

module.exports = server.exports();
