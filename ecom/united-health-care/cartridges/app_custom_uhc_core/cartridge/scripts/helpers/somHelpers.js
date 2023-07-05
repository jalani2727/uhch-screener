'use strict';

var base = module.superModule;
var utilHelpers = require('*/cartridge/scripts/helpers/utilHelpers');

/**
 *
 * @param {Object} config - an object cotaining information to create the list of fulfill items
 * Added trcking number and url form the config
 * @property {string} somOrderSummaryId - SOM order Summary ID
 * @property {Array} somFulfillmentOrderLineItems - a list of SOM FulfillmentOrderLineItem object
 * @property {string} currencyCode - the currencyCode
 * @property {Array} somOrderToOrderItemSummariesMap - a map of SOM orderSummaryId to OrderItemSummaries
 * @returns {Array} - an array of fulfilled order items
 */
base.getFulfillOrderLineItems = function getFulfillOrderLineItems(config) {
    var hasReturned = config.hasReturned;
    var currencyCode = config.currencyCode;
    var fulfillItems = config.somFulfillmentOrderLineItems;
    var tracking = config.shipmentTrackingData;

    var fulfillOrderItems = [];
    var orderItemDetail;

    if (config.somFulfillmentOrderLineItems) {
        for (var i = 0, len = fulfillItems.length; i < len; i++) {
            var orderItemSummaryId = fulfillItems[i].OrderItemSummaryId;
            var order = config.somOrderToOrderItemSummariesMap['_' + config.somOrderSummaryId];
            var somOrderItemSummary = order['_' + orderItemSummaryId];

            orderItemDetail = {
                orderItemSummaryId: orderItemSummaryId,
                currencyCode: currencyCode,
                sfccProductId: somOrderItemSummary.ProductCode,
                fulfillmentOrderLineItemId: fulfillItems[i].Id,
                quantity: somOrderItemSummary.Quantity,
                quantityAvailableToCancel: somOrderItemSummary.QuantityAvailableToCancel,
                quantityAvailableToFulfill: somOrderItemSummary.QuantityAvailableToFulfill,
                quantityAvailableToReturn: somOrderItemSummary.QuantityAvailableToReturn,
                quantityOrdered: somOrderItemSummary.QuantityOrdered,
                quantityCanceled: somOrderItemSummary.QuantityCanceled,
                quantityReturned: somOrderItemSummary.QuantityReturned,
                totalPrice: fulfillItems[i].TotalPrice,
                price: somOrderItemSummary.UnitPrice,
                trackingNumber: tracking ? tracking.trackingNumber : '',
                trackingURL: tracking ? tracking.trackingUrl : ''
            };

            if (hasReturned) {
                if (orderItemDetail.quantityReturned > 0) {
                    orderItemDetail.quantity = orderItemDetail.quantityReturned;
                    orderItemDetail.totalPrice = utilHelpers.calculateTotalPrice(orderItemDetail.price, orderItemDetail.quantity, currencyCode);
                    fulfillOrderItems.push(orderItemDetail);
                }
            } else if (orderItemDetail.quantity > 0) {
                fulfillOrderItems.push(orderItemDetail);
            }
        }
    }

    return fulfillOrderItems;
};

/**
 *
 * @param {Object} config - an object cotaining information to create the list of fulfill items
 * @property {Array} orderItemSummaries - a list of SOM orderItemSummaries object
 * @property {string} currencyCode - the currencyCode
 * @property {boolean} hasFulfillment - a flag indicating fulfillment(s) exist in order
 * @returns {Array} - a list of order items those have not yet fulfilled.
 */
base.getNoneFulfillOrderLineItems = function getNoneFulfillOrderLineItems(config) {
    var orderItemSummaries = config.orderItemSummaries;
    var currencyCode = config.currencyCode;
    var hasFulfillment = config.hasFulfillment;
    var hasCanceled = config.hasCanceled;


    var noneFulfillOrderItemSummaries = [];
    var orderItemDetail;

    for (var i = 0, len = orderItemSummaries.length; i < len; i++) {
        orderItemDetail = {
            orderItemSummaryId: orderItemSummaries[i].Id,
            currencyCode: currencyCode,
            sfccProductId: orderItemSummaries[i].ProductCode,
            fulfillmentOrderLineItemId: null,
            quantityAvailableToCancel: orderItemSummaries[i].QuantityAvailableToCancel,
            quantityAvailableToFulfill: orderItemSummaries[i].QuantityAvailableToFulfill,
            quantityAvailableToReturn: orderItemSummaries[i].QuantityAvailableToReturn,
            quantityOrdered: orderItemSummaries[i].QuantityOrdered,
            quantityCanceled: orderItemSummaries[i].QuantityCanceled,
            quantityReturned: orderItemSummaries[i].QuantityReturned,
            quantity: orderItemSummaries[i].Quantity,
            totalPrice: orderItemSummaries[i].TotalPrice,
            price: orderItemSummaries[i].UnitPrice,
            totalOrigPrice: utilHelpers.calculateTotalPrice(orderItemSummaries[i].UnitPrice, orderItemSummaries[i].Quantity, currencyCode)
        };

        if (hasFulfillment) {
            if (orderItemSummaries[i].QuantityAvailableToFulfill > 0) {
                orderItemDetail.quantity = orderItemSummaries[i].QuantityAvailableToFulfill;
                orderItemDetail.totalPrice = utilHelpers.calculateTotalPrice(orderItemDetail.price, orderItemDetail.quantity, currencyCode);
                noneFulfillOrderItemSummaries.push(orderItemDetail);
            }
        } else if (hasCanceled) {
            if (orderItemSummaries[i].QuantityCanceled > 0) {
                orderItemDetail.quantity = orderItemSummaries[i].QuantityCanceled;
                orderItemDetail.totalPrice = utilHelpers.calculateTotalPrice(orderItemDetail.price, orderItemDetail.quantity, currencyCode);
                noneFulfillOrderItemSummaries.push(orderItemDetail);
            }
        } else if (orderItemDetail.quantity > 0) {
            noneFulfillOrderItemSummaries.push(orderItemDetail);
        }
    }
    return noneFulfillOrderItemSummaries;
};


module.exports = base;
