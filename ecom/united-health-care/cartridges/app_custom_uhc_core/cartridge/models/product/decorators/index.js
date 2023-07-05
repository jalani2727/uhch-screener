'use strict';

var baseIndex = module.superModule;

baseIndex.productBadge = require('*/cartridge/models/product/decorators/productBadge');
baseIndex.custom = require('*/cartridge/models/product/decorators/customAttributes');
baseIndex.customerPrice = require('*/cartridge/models/product/decorators/customerPrice');

module.exports = baseIndex;
