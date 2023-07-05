'use strict';

var ProductInventoryMgr = require('dw/catalog/ProductInventoryMgr');
var preferences = require('*/cartridge/config/preferences');
var DEFAULT_MAX_ORDER_QUANTITY = preferences.maxOrderQty || 10;
var OTC_MAX_ORDER_QUANTITY = preferences.otcMaxOrderQty || 5;

/**
 * get the min and max numbers to display in the quantity drop down.
 * @param {Object} productLineItem - a line item of the basket.
 * @param {number} quantity - number of items for this product
 * @returns {Object} The minOrderQuantity and maxOrderQuantity to display in the quantity drop down.
 */
function getMinMaxQuantityOptions(productLineItem, quantity) {
    var max;
    var inventoryList = ProductInventoryMgr.getInventoryList();
    var inventoryRecord = productLineItem.product.availabilityModel.inventoryRecord;
    if (productLineItem.productInventoryListID) {
        inventoryList = ProductInventoryMgr.getInventoryList(productLineItem.productInventoryListID);
        inventoryRecord = inventoryList.getRecord(productLineItem.product.ID);
    }

    if ((inventoryRecord && inventoryRecord.perpetual) || (!inventoryRecord && inventoryList.defaultInStockFlag)) {
        max = Math.max(DEFAULT_MAX_ORDER_QUANTITY, quantity);
    } else {
        var availableToSell = (inventoryRecord.ATS && inventoryRecord.ATS.value) || 0;
        max = Math.max(Math.min(availableToSell, DEFAULT_MAX_ORDER_QUANTITY), quantity);
    }
    return {
        minOrderQuantity: productLineItem.product.minOrderQuantity.value || 1,
        maxOrderQuantity: !productLineItem.product.custom.isOTCProduct ? max : OTC_MAX_ORDER_QUANTITY
    };
}

module.exports = function (object, productLineItem, quantity) {
    Object.defineProperty(object, 'quantityOptions', {
        enumerable: true,
        value: getMinMaxQuantityOptions(productLineItem, quantity)
    });
};
