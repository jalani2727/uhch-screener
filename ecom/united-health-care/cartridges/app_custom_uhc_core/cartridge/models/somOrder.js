'use strict';

var base = module.superModule;

/**
 * Create a SOM order model (should be changed towards simplification! it is very difficult to understand the behavior now)
 *
 * @constructor
 * @classdesc class that represents a SOM order
 *
 * @param {Object} somApiOrderSummary - OrderSummary object from SOM API in JSON format
 * @param {Object} somOrderToOrderItemSummariesMap - the map of SOM OrderSummary to OrderItemsSummaries
 * @param {Object} somOrderToFulfillmentMap - the map of SOM OrderSummary to Fulfillmentorders
 * @param {Object} somOrderToOrderPaymentSummariesMap - the map of SOM somOrderToOrderPaymentSummariesMap to OrderItemsSummaries
 * @param {Object} somAccount - somAccount object from SOM API in JSON format
 */
module.exports = function SomOrderModel(somApiOrderSummary, somOrderToOrderItemSummariesMap, somOrderToFulfillmentMap, somOrderToOrderPaymentSummariesMap) {
    base.call(this, somApiOrderSummary, somOrderToOrderItemSummariesMap, somOrderToFulfillmentMap, somOrderToOrderPaymentSummariesMap);
    if (somApiOrderSummary && somApiOrderSummary.OrderDeliveryGroupSummaries && somApiOrderSummary.OrderDeliveryGroupSummaries.records[0] && somApiOrderSummary.OrderDeliveryGroupSummaries.records[0].DeliverToName) {
        this.customerName = somApiOrderSummary.OrderDeliveryGroupSummaries.records[0].DeliverToName;
    }
    // To get all items printed in order details
    var totalItems = [];
    if (this.inProgressStatusGroupItems.length > 0) {
        totalItems.push(this.inProgressStatusGroupItems);
    }
    if (this.shippedStatusGroupItems.length > 0) {
        totalItems.push(this.shippedStatusGroupItems);
    }
    if (this.returnedStatusGroupItems.length > 0) {
        totalItems.push(this.returnedStatusGroupItems);
    }
    if (this.orderedStatusGroupItems.length > 0) {
        totalItems.push(this.orderedStatusGroupItems);
    }
    if (this.canceledStatusGroupItems.length > 0) {
        totalItems.push(this.canceledStatusGroupItems);
    }
    this.totalItems = totalItems;
};
