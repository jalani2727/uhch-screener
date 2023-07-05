'use strict';

var ProductInventoryMgr = require('dw/catalog/ProductInventoryMgr');

/**
 * Check if an inventory record is perpetual or has an ATS greater or equal to a requested quantity
 * or the inventory record does not exists and the inventory list has default in stock flag
 * @param {dw.catalog.ProductInventoryList} inventoryList inventory list to check
 * @param {dw.catalog.ProductInventoryRecord} inventoryRecord product inventory record to check
 * @param {number} totalQtyRequested requested quantity
 * @returns {boolean} true if the inventory record is perpetual or has the ATS greater or equal to the requested quantity
 * or the inventory record does not exists and the inventory list has default in stock flag; false otherwise
 */
function isAvailableToSell(inventoryList, inventoryRecord, totalQtyRequested) {
    var productInventoryList = inventoryList || ProductInventoryMgr.getInventoryList();
    var isInventoryListDefaultInstock = productInventoryList && productInventoryList.defaultInStockFlag;
    var perpetual = inventoryRecord && inventoryRecord.perpetual;
    var ats = (inventoryRecord && inventoryRecord.ATS && inventoryRecord.ATS.value) || 0;
    return perpetual || ats >= totalQtyRequested || isInventoryListDefaultInstock;
}

module.exports = {
    isAvailableToSell: isAvailableToSell
};
