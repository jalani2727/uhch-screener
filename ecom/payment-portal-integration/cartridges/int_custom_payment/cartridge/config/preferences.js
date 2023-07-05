'use strict';

var base = module.superModule;
var Site = require('dw/system/Site');
var currentSite = Site.getCurrent();

base.upgRequestTypeAuth_PP = Site.current.getCustomPreferenceValue('upgRequestTypeAuth_PP');
base.upgAccountId_PP = Site.current.getCustomPreferenceValue('upgAccountId_PP');
base.upgProcessingMode_PP = Site.current.getCustomPreferenceValue('upgProcessingMode_PP');
base.upgTransactionIndustryType_PP = Site.current.getCustomPreferenceValue('upgTransactionIndustryType_PP');
base.upgNotifyURL_PP = Site.current.getCustomPreferenceValue('upgNotifyURL_PP');
base.upgReturnURLPolicy_PP = Site.current.getCustomPreferenceValue('upgReturnURLPolicy_PP');
base.upgReturnURL_PP = Site.current.getCustomPreferenceValue('upgReturnURL_PP');
base.upgCancelURL_PP = Site.current.getCustomPreferenceValue('upgCancelURL_PP');
base.upgAccountType_PP = Site.current.getCustomPreferenceValue('upgAccountType_PP');
base.upgParsedData_PP = Site.current.getCustomPreferenceValue('upgParsedData_PP');
base.upgRequestTypeFind_PP = Site.current.getCustomPreferenceValue('upgRequestTypeFind_PP');
base.upgHPPRedirectEndpoint_PP = Site.current.getCustomPreferenceValue('upgHPPRedirectEndpoint_PP');
base.upgCreditCardType_PP = Site.current.getCustomPreferenceValue('upgCreditCardType_PP');
base.upgStyleURL_PP = Site.current.getCustomPreferenceValue('upgStyleURL_PP');
base.orderEncryptionKey_PP = Site.current.getCustomPreferenceValue('orderEncryptionKey_PP');
base.orderEncryptionSalt_PP = Site.current.getCustomPreferenceValue('orderEncryptionSalt_PP');
base.customerSvcMail = currentSite.getCustomPreferenceValue('customerServiceEmail');

module.exports = base;
