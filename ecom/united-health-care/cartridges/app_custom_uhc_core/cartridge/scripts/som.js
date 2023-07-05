'use strict';

var base = module.superModule;

var ServiceMgr = require('*/cartridge/scripts/services/somServiceMgr');
var Logger = require('dw/system/Logger');
var somPreferences = require('*/cartridge/config/somPreferences');

/**
 * Creates the SOM query to get the FulfillmentOrderShipments
 * @param {string} fulfillmentIdRef - a ID referencing the result for workaround.
 * @returns {string} api query.
 */
function getOrderShipmentsQuery(fulfillmentIdRef) {
    var orderShipmentsQuery;
    if (somPreferences.orderHistoryQuery && somPreferences.orderHistoryQuery.fulfillmentOrderShipments) {
        orderShipmentsQuery = somPreferences.orderHistoryQuery.fulfillmentOrderShipments;
    } else {
        orderShipmentsQuery = 'SELECT+' +
                                'Shipment.FulfillmentOrderId,' +
                                'Shipment.Id,' +
                                'Shipment.CreatedDate,' +
                                'Shipment.ShipToName,' +
                                'Shipment.Status,' +
                                'Shipment.TrackingNumber,' +
                                'Shipment.Tracking_Url__c+';
        if (fulfillmentIdRef) {
            orderShipmentsQuery += 'FROM+Shipment+';
            orderShipmentsQuery += "WHERE+FulfillmentOrder.OrderSummary.Id='" + fulfillmentIdRef + "'";
        } else {
            orderShipmentsQuery += 'FROM+FulfillmentOrderShipments';
        }
    }
    return orderShipmentsQuery;
}

/**
 * Creates the SOM query to get the FulfillmentOrderLineItem
 * @returns {string} api query.
 */
function getFulfillmentOrderLineItemsQuery() {
    var fulfillmentOrderLineItemsQuery;

    if (somPreferences.orderHistoryQuery && somPreferences.orderHistoryQuery.fulfillmentOrderLineItems) {
        fulfillmentOrderLineItemsQuery = somPreferences.orderHistoryQuery.fulfillmentOrderLineItems;
    } else {
        fulfillmentOrderLineItemsQuery = 'SELECT+FulfillmentOrderLineItem.Id,' +
                                                'FulfillmentOrderLineItem.OrderItemSummaryId,' +
                                                'FulfillmentOrderLineItem.Quantity,' +
                                                'FulfillmentOrderLineItem.TotalPrice,' +
                                                'FulfillmentOrderLineItem.TotalTaxAmount+' +
                                        'FROM+FulfillmentOrderLineItems+' +
                                        "WHERE+FulfillmentOrderLineItem.TypeCode='Product'";
    }

    return fulfillmentOrderLineItemsQuery;
}

/**
 * Creates the SOM query to get the fulfillment information from SOM FulfillmentOrder.
 * @param {string} orderSummaryIdRef - a ID referencing the result of the OrderSummary query.
 * @param {string} ordersummariesIDsStr - SOM order IDs
 * @param {string} fulfillmentId - SOM fulfillment ID
 * @returns {string} api query.
 */
function getFulfillmentQuery(orderSummaryIdRef, ordersummariesIDsStr, fulfillmentId) {
    var query;
    var select;
    var from;
    var where;

    var fulfillmentOrderLineItems = getFulfillmentOrderLineItemsQuery();
    var orderShipments = getOrderShipmentsQuery();

    select = 'SELECT+' +
        'FulfillmentOrder.OrderSummaryId,' +
        'FulfillmentOrder.id,' +
        'FulfillmentOrder.DeliveryMethodId,' +
        'FulfillmentOrder.CreatedDate,' +
        'FulfillmentOrder.ItemCount,' +
        'FulfillmentOrder.Status,' +
        'FulfillmentOrder.StatusCategory,' +
        'FulfillmentOrder.FulfilledToAddress,' +
        'FulfillmentOrder.TotalAmount,' +
        'FulfillmentOrder.TotalTaxAmount,' +
        '(' + fulfillmentOrderLineItems + ')';

    select +=
        ',(' + orderShipments + ')';

    from = 'FROM+FulfillmentOrder';

    where = '';

    if (orderSummaryIdRef) {
        where = "WHERE+FulfillmentOrder.OrderSummaryId+=+'" + orderSummaryIdRef + "'";
    } else if (ordersummariesIDsStr) {
        where = 'WHERE+FulfillmentOrder.OrderSummaryId+in+(' + ordersummariesIDsStr + ')';
    } else {
        where = "WHERE+FulfillmentOrder.Id+=+'" + fulfillmentId + "'";
    }
    where += " AND FulfillmentOrder.Status != 'Canceled'";

    query = select + '+' + from + '+' + where;

    return query;
}

/**
 * Creates the SOM query to get the FulfillmentOrderLineItem
 * @param {string} ref - a ID referencing the result of the OrderSummary query.
 * @returns {string} api query.
 */
function getPaymentMethodQuery(ref) {
    var query;
    var select;
    var from;
    var where;

    select = 'SELECT+' +
                'CardPaymentMethod.Id,' +
                'CardPaymentMethod.DisplayCardNumber,' +
                'CardPaymentMethod.CardHolderName,' +
                'CardPaymentMethod.ExpiryMonth,' +
                'CardPaymentMethod.ExpiryYear,' +
                'CardPaymentMethod.CardCategory,' +
                'CardPaymentMethod.CardType,' +
                'CardPaymentMethod.CardTypeCategory';
    from = 'FROM+CardPaymentMethod';
    where = '';
    if (ref) {
        where = "+ WHERE+CardPaymentMethod.Id+=+'" + ref + "'";
    }
    query = select + '+' + from + where;
    return query;
}

/**
 * Creates the SOM query to get the FulfillmentOrderLineItem
 * @param {string} ref - a ID referencing the result of the OrderSummary query.
 * @returns {string} api query.
 */
function getDeliveryMethodQuery(ref) {
    var query;
    var select;
    var from;
    var where;

    select = 'SELECT+Id,Name,Description,ProductId,ReferenceNumber';
    from = 'FROM+OrderDeliveryMethod';
    where = "WHERE+OrderDeliveryMethod.Id+=+'" + ref + "'";

    query = select + '+' + from + '+' + where;
    return query;
}

/**
 * Return an object containing response from SOM for the specified order and fulfillment
 * In the case of an error this function returns undefined
 * @param {string} orderSummaryId - SOM orderSummaryId
 * @param {string} fulfillmentId - SOM fulfillmentId
 * @returns {Object} apiResponse - response from SOM query
 */
base.getOrderAndFulfillment = function getOrderAndFulfillment(orderSummaryId, fulfillmentId) {
    var svc = ServiceMgr.restComposite();
    var apiResponse;
    var orderSummaryQuery = base.getOrderSummaryQuery(null, orderSummaryId, null);

    if (orderSummaryQuery && orderSummaryQuery.length && orderSummaryQuery.length < 100000) {
        var orderSummaryIdRef = '@{refOrderSummaries.records[0].Id}';
        var orderPaymentMethodRef = '@{refOrderSummaries.records[0].OrderPaymentSummaries.records[0].PaymentMethodId}';
        var orderDeliveryMethodRef = '@{refOrderSummaries.records[0].OrderDeliveryGroupSummaries.records[0].OrderDeliveryMethodId}';
        var fulfillmentQuery;
        var paymentMethodQuery;
        var deliveryMethodQuery;

        if (fulfillmentId) {
            fulfillmentQuery = getFulfillmentQuery(null, null, fulfillmentId);
        } else {
            fulfillmentQuery = getFulfillmentQuery(orderSummaryIdRef);
        }

        paymentMethodQuery = getPaymentMethodQuery(orderPaymentMethodRef);
        deliveryMethodQuery = getDeliveryMethodQuery(orderDeliveryMethodRef);

        if (fulfillmentQuery && fulfillmentQuery.length > 0 && fulfillmentQuery.length < 100000) {
            var payload = {
                compositeRequest: [{
                    method: 'GET',
                    url: ServiceMgr.restEndpoints.query + '/?q=' + orderSummaryQuery,
                    referenceId: 'refOrderSummaries'
                }, {
                    method: 'GET',
                    url: ServiceMgr.restEndpoints.query + '/?q=' + fulfillmentQuery,
                    referenceId: 'refFulfillmentOrders0'
                }, {
                    method: 'GET',
                    url: ServiceMgr.restEndpoints.query + '/?q=' + paymentMethodQuery,
                    referenceId: 'paymentMethod'
                }, {
                    method: 'GET',
                    url: ServiceMgr.restEndpoints.query + '/?q=' + deliveryMethodQuery,
                    referenceId: 'deliveryMethod'
                },
                { // for workaround
                    method: 'GET',
                    url: ServiceMgr.restEndpoints.query + '/?q=' + getOrderShipmentsQuery('@{orderSummaryIdRef}'),
                    referenceId: 'shipment'
                }]
            };
            var req = JSON.stringify(payload);
            apiResponse = svc.call(req);
        } else if (fulfillmentQuery && fulfillmentQuery.length > 100000) {
            Logger.error('fulfillmentQuery in getOrderAndFulfillment has exceeded length limit of 100000 characters');
        }
    } else if (orderSummaryQuery && orderSummaryQuery.length > 100000) {
        Logger.error('orderSummaryQuery in getOrderAndFulfillment has exceeded length limit of 100000 characters');
    }
    return apiResponse;
};

/**
 * Return an object containing response from SOM for orders and fulfillments by orderNumbers
 * @param {array} orderNumbers - order numbers
 * @returns {OrderSummary} order summary instance.
 */
base.getOrdersSummary = function getOrdersSummary(orderNumbers) {
    var fulfillmentQuery;
    var paymentMethodQuery;
    var deliveryMethodQuery;
    var apiResponse;
    var payload;
    var svc = ServiceMgr.restComposite();
    var query = base.getOrderSummaryQuery(orderNumbers, null, null);

    if (query && query.length && query.length < 100000) {
        var orderSummaryIdRef = '@{refOrderSummaries.records[0].Id}';
        var orderPaymentMethodRef = '@{refOrderSummaries.records[0].OrderPaymentSummaries.records[0].PaymentMethodId}';
        var orderDeliveryMethodRef = '@{refOrderSummaries.records[0].OrderDeliveryGroupSummaries.records[0].OrderDeliveryMethodId}';

        fulfillmentQuery = getFulfillmentQuery(orderSummaryIdRef, null);
        paymentMethodQuery = getPaymentMethodQuery(orderPaymentMethodRef);
        deliveryMethodQuery = getDeliveryMethodQuery(orderDeliveryMethodRef);

        if (fulfillmentQuery && fulfillmentQuery.length > 0 && fulfillmentQuery.length < 100000) {
            payload = {
                compositeRequest: [{
                    method: 'GET',
                    url: ServiceMgr.restEndpoints.query + '/?q=' + query,
                    referenceId: 'refOrderSummaries'
                }, {
                    method: 'GET',
                    url: ServiceMgr.restEndpoints.query + '/?q=' + fulfillmentQuery,
                    referenceId: 'refFulfillmentOrders0'
                }, {
                    method: 'GET',
                    url: ServiceMgr.restEndpoints.query + '/?q=' + paymentMethodQuery,
                    referenceId: 'paymentMethod'
                }, {
                    method: 'GET',
                    url: ServiceMgr.restEndpoints.query + '/?q=' + deliveryMethodQuery,
                    referenceId: 'deliveryMethod'
                }, { // for workaround
                    method: 'GET',
                    url: ServiceMgr.restEndpoints.query + '/?q=' + getOrderShipmentsQuery('@{refOrderSummaries.records[0].Id}'),
                    referenceId: 'shipment'
                }]
            };
            var req = JSON.stringify(payload);
            apiResponse = svc.call(req);
        } else if (fulfillmentQuery && fulfillmentQuery.length > 100000) {
            Logger.error('Fulfillment has exceeded length limit of 100000 characters');
        }
    } else if (query && query.length > 100000) {
        Logger.error('Query has exceeded length limit of 100000 characters');
    }

    return apiResponse;
};

module.exports = base;
