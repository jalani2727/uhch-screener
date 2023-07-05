'use strict';

/**
 * @namespace Coverage
 */

var server = require('server');
var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn');
var Logger = require('dw/system/Logger');
var pageMetaData = require('*/cartridge/scripts/middleware/pageMetaData');
var Site = require('dw/system/Site');
var currentSiteID = Site.current.ID;
var currentSitePipeline = 'Sites-' + currentSiteID + '-Site';

/**
 * Coverage-Show : This endpoint is called when a shopper navigates to the Coverage page
 * @name Base/Coverage-Show
 * @function
 * @memberof Coverage
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get(
    'Show',
    server.middleware.https,
    userLoggedIn.validateLoggedIn,
    function (req, res, next) {
        var profile = req.currentCustomer.profile;
        var preferences = require('*/cartridge/config/preferences.js');
        var coverageHelpers = require('*/cartridge/scripts/helpers/coverageHelpers.js');
        var contentAssetValues = [];
        var isDynamic = false;
        var benefits = '';
        var hearingAidQuantity;
        var benefitFrequency;
        var viewCoverageType;
        var allowance;
        var availableAssets;
        var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
        if (req.pageMetaData.title === currentSitePipeline) {
            var nameObj = JSON.parse(preferences.pageMetaTitle);
            var title = {};
            title.pageTitle = nameObj['Coverage-Show'] ? nameObj['Coverage-Show'].pageTitle : currentSitePipeline;
            pageMetaHelper.setPageMetaData(req.pageMetaData, title);
        }

        if (profile && !empty(preferences.coverageMapping)) {
            viewCoverageType = coverageHelpers.getViewCoverageType();
            if (viewCoverageType === 'DynamicUHC-1' || viewCoverageType === 'DynamicUHC-2') {
                var customerDetails = JSON.parse(session.privacy.customerDetails);
                benefits = customerDetails.Benefits ? JSON.parse(customerDetails.Benefits) : '';
                hearingAidQuantity = customerDetails.hearingAidQuantity;
                benefitFrequency = customerDetails.benefit_frequency;
                allowance = customerDetails.benefit_max;
                isDynamic = true;
                availableAssets = JSON.parse(preferences.coverageBenefitsDescription);
            } else {
                try {
                    var coverageMapping = JSON.parse(preferences.coverageMapping);
                    if (coverageMapping[viewCoverageType]) {
                        contentAssetValues = coverageMapping[viewCoverageType].assets;
                    }
                } catch (e) {
                    contentAssetValues = [];
                    Logger.error('Error while parsing coverageMapping ' + e);
                }
            }
        }
        res.render('coverageView/coverageLanding', {
            profile: profile,
            contentAssetValues: contentAssetValues,
            isDynamic: isDynamic,
            benefits: benefits,
            benefitsAssets: availableAssets,
            hearingAidQuantity: hearingAidQuantity,
            benefitFrequency: benefitFrequency,
            viewCoverageType: viewCoverageType,
            allowance: allowance,
            viewCoverageBenifitType: coverageHelpers.getViewCoverageBenifitType()
        });
        next();
    }, pageMetaData.computedPageMetaData
);

module.exports = server.exports();
