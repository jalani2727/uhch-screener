'use strict';

var base = module.superModule;
var Site = require('dw/system/Site');
var currentSite = Site.getCurrent();

base.useAARP = currentSite.getCustomPreferenceValue('useAARP');
base.enableAdobeDataLayer = currentSite.getCustomPreferenceValue('enableAdobeDataLayer');

module.exports = base;
