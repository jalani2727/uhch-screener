'use strict';

var base = module.superModule;
var Site = require('dw/system/Site');

base.upgRequestTypeAuth = Site.current.getCustomPreferenceValue('upgRequestTypeAuth');
base.upgAccountId = Site.current.getCustomPreferenceValue('upgAccountId');
base.upgProcessingMode = Site.current.getCustomPreferenceValue('upgProcessingMode');
base.upgTransactionIndustryType = Site.current.getCustomPreferenceValue('upgTransactionIndustryType');
base.upgNotifyURL = Site.current.getCustomPreferenceValue('upgNotifyURL');
base.upgReturnURLPolicy = Site.current.getCustomPreferenceValue('upgReturnURLPolicy');
base.upgReturnURL = Site.current.getCustomPreferenceValue('upgReturnURL');
base.upgCancelURL = Site.current.getCustomPreferenceValue('upgCancelURL');
base.upgAccountType = Site.current.getCustomPreferenceValue('upgAccountType');
base.upgParsedData = Site.current.getCustomPreferenceValue('upgParsedData');
base.upgRequestTypeFind = Site.current.getCustomPreferenceValue('upgRequestTypeFind');
base.upgHPPRedirectEndpoint = Site.current.getCustomPreferenceValue('upgHPPRedirectEndpoint');
base.upgCreditCardType = Site.current.getCustomPreferenceValue('upgCreditCardType');
base.upgStyleURL = Site.current.getCustomPreferenceValue('upgStyleURL');
base.orderEncryptionKey = Site.current.getCustomPreferenceValue('orderEncryptionKey');
base.orderEncryptionSalt = Site.current.getCustomPreferenceValue('orderEncryptionSalt');

module.exports = base;
