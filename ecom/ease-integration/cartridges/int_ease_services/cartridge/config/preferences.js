'use strict';

var base = module.superModule;
var Site = require('dw/system/Site');

base.brandingID = Site.current.getCustomPreferenceValue('brandingID');
base.createdBy = Site.current.getCustomPreferenceValue('createdBy');
base.updatedBy = Site.current.getCustomPreferenceValue('updatedBy');
base.leadSource = Site.current.getCustomPreferenceValue('leadSource');

module.exports = base;
