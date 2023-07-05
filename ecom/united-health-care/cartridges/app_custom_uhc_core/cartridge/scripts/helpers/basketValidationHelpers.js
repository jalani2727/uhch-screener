'use strict';

var base = module.superModule;

var collections = require('*/cartridge/scripts/util/collections');

var ProductInventoryMgr = require('dw/catalog/ProductInventoryMgr');
var StoreMgr = require('dw/catalog/StoreMgr');


/**
 * validates that the product line items exist, are online, and have available inventory (including defaultInstock flag).
 * @param {dw.order.Basket} basket - The current user's basket
 * @returns {Object} an error object
 */
base.validateProducts = function validateProducts(basket) {
    var inventoryHelpers = require('*/cartridge/scripts/helpers/inventoryHelpers');
    var result = {
        error: false,
        hasInventory: true
    };
    var productLineItems = basket.productLineItems;

    collections.forEach(productLineItems, function (item) {
        if (item.product === null || !item.product.online) {
            result.error = true;
            return;
        }

        if (Object.hasOwnProperty.call(item.custom, 'fromStoreId')
            && item.custom.fromStoreId) {
            var store = StoreMgr.getStore(item.custom.fromStoreId);
            var storeInventory = ProductInventoryMgr.getInventoryList(store.custom.inventoryListId);
            var storeInventoryRecord = storeInventory.getRecord(item.productID);

            result.hasInventory = result.hasInventory
                  && inventoryHelpers.isAvailableToSell(storeInventory, storeInventoryRecord, item.quantityValue);
        } else {
            var availabilityLevels = item.product.availabilityModel
                .getAvailabilityLevels(item.quantityValue);
            result.hasInventory = result.hasInventory
                && (availabilityLevels.notAvailable.value === 0);
        }
    });

    return result;
};

module.exports = base;
