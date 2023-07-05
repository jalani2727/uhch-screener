'use strict';

var base = module.superModule;
var Logger = require('dw/system/Logger');
var ProductMgr = require('dw/catalog/ProductMgr');

var som = require('*/cartridge/scripts/som');
var somPreferences = require('*/cartridge/config/somPreferences');
var somHelper = require('*/cartridge/scripts/helpers/somHelpers');
var SomOrderModel = require('*/cartridge/models/somOrder');

var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
var utilHelpers = require('*/cartridge/scripts/helpers/utilHelpers');
var productDecorators = require('*/cartridge/models/product/decorators/index');

/**
 * Returns a list of orders for the current customer with filters values
 * @param {Object} currentCustomer - object with customer properties
 * @param {Object} queryString - object of query string parameters
 * @returns {Object} - Object with an array of order models and filters
 * */
base.getOrders = function getOrders(currentCustomer, queryString) {
    var orders = [];
    var filters = base.getFilters(queryString);

    var somApiResponse = som.getOrders(currentCustomer.raw, filters);

    if (somApiResponse && somApiResponse.ok) {
        orders = base.createOrderModels(somApiResponse);
    } else {
        Logger.error('Error getting orders from SOM. \n ' + JSON.stringify(somApiResponse, null, 4));
    }

    return {
        orders: orders,
        filterValues: somPreferences.filters ? somPreferences.filters : []
    };
};

/**
 * Returns a list of order models for the current customer based on response from SOM.
 * the response is assumed to contain the following elements in the following order
 * [0] - OrderSummaries
 * [1] - FulfillmentOrders
 * [2] - paymentMethod
 * [3] - [delivery]
 * [4] - [shipment]
 * @param {Object} somApiResponse - response object from SOM
 * @returns {Object} - Object with an array of order models
 */
base.createOrderModels = function createOrderModels(somApiResponse) {
    var orders = [];
    var compositeResponses = somApiResponse.object.responseObj;
    if (compositeResponses && compositeResponses.compositeResponse[0].body.records.length > 0) {
        var orderModel;
        var somApiOrders = compositeResponses.compositeResponse[0];
        var somApiFulfillmentOrders = compositeResponses.compositeResponse[1];
        var somApiPayment = compositeResponses.compositeResponse[2];

        var orderSummaryToFulfillmentMap = null;
        orderSummaryToFulfillmentMap = somHelper.createFulfillmentOrderMapObjects(somApiFulfillmentOrders, orderSummaryToFulfillmentMap);
        var orderSummaryMap = null;
        orderSummaryMap = somHelper.createOrderSummaryMapObjects(somApiOrders, somApiPayment);

        var somApiOrder;
        for (var i = 0; i < somApiOrders.body.records.length; i++) {
            somApiOrder = somApiOrders.body.records[i];
            // Commented as we are not passing account query in payload to avoid 6 calls to OMS
            // For Order history as account call gets called keeping it here for account
            // if (compositeResponses.compositeResponse[3] && compositeResponses.compositeResponse[3].body.records[i]) {
            //     somApiOrder.Account = compositeResponses.compositeResponse[3].body.records[i];
            // }

            if (compositeResponses.compositeResponse[3] && compositeResponses.compositeResponse[3].body.records[i]) {
                somApiOrder.DeliveryMethod = compositeResponses.compositeResponse[3].body.records[i];
            }

            // Added this to get tracking number and url
            if (compositeResponses.compositeResponse[4] && 'records' in compositeResponses.compositeResponse[4].body && compositeResponses.compositeResponse[4].body.records.length > 0) {
                somApiOrder.Shipment = compositeResponses.compositeResponse[4].body.records;
            }
            somApiOrder.OrderItemGrouped = base.splitDeliveryItems(somApiOrder);
            somApiOrder.OrderItemSummaries.records = somApiOrder.OrderItemGrouped.Product;
            somApiOrder.OrderItemSummaries.totalSize = somApiOrder.OrderItemGrouped.Product.length;
            orderModel = new SomOrderModel(
                somApiOrder,
                orderSummaryMap.orderSummaryToOrderItemSummaries,
                orderSummaryToFulfillmentMap.orderSummaryToFulfillmentOrders,
                orderSummaryMap.orderSummaryToOrderPaymentSummaries);
            if (orderModel) {
                orders.push(orderModel);
            }
        }
    }
    return orders;
};

/**
 * Get Order Summary Responce by orderNumber
 * @param {string} orderNumber - The order number for the order
 * @returns {Object} an object of the customer's last order
 */
base.getOrderSummary = function getOrderSummary(orderNumber) {
    var OrderModel = {};
    var somApiResponse = som.getOrdersSummary([orderNumber]);
    if (somApiResponse && somApiResponse.ok) {
        OrderModel = base.createOrderModels(somApiResponse)[0];
        OrderModel.fulfillmentStatus = base.getFulfillmentStatus(OrderModel);
    } else {
        Logger.error('Error getting orders from SOM in getOrderDetails. \n ' + JSON.stringify(somApiResponse, null, 4));
    }
    return OrderModel;
};

/**
 * Creates a SOM order model for order detail page
 * To get all items in order detail we added a condition of req.querystring.fulfillmentId
 * @param {Object} req - the request object
 * @returns {Object} an object of the som order model
 */
base.getOrderDetails = function getOrderDetails(req) {
    var orders = null;
    var orderModel = null;
    if (req.querystring.fulfillmentId) {
        var somApiResponse = som.getOrderAndFulfillment(req.querystring.orderSummaryId, req.querystring.fulfillmentId);
        if (somApiResponse && somApiResponse.ok) {
            orders = base.createOrderModels(somApiResponse);
            if (orders && orders.length) {
                orderModel = orders[0];
            }
            orderModel.fulfillmentStatus = base.getFulfillmentStatus(orderModel);
            return orderModel;
        }
        Logger.error('Error getting orders from SOM in getOrderDetails. \n ' + JSON.stringify(somApiResponse, null, 4));
    } else {
        orderModel = base.getOrderSummary(req.querystring.orderID);
    }
    return orderModel;
};

/**
 * add product information from eCom
 * @param {Object} orderItem - ordered item
 * @param {Object} currencyCode - currency code
 */
base.addProductData = function addProductData(orderItem, currencyCode) {
    var apiProduct = ProductMgr.getProduct(orderItem.sfccProductId);
    if (apiProduct !== null) {
        var variationsPLI = productHelper.getVariationModel(apiProduct, null);
        if (variationsPLI) {
            apiProduct = variationsPLI.getSelectedVariant() || apiProduct; // eslint-disable-line
        }

        // nonRMA check
        var nonRMA = false;
        if (somPreferences.checkNonRMA && apiProduct.custom[somPreferences.nonRMAProductCustomAttribute]) {
            nonRMA = apiProduct.custom[somPreferences.nonRMAProductCustomAttribute];
        }

        var product = Object.create(null);
        var productType = productHelper.getProductType(apiProduct);
        productDecorators.base(product, apiProduct, productType);
        productDecorators.images(product, apiProduct, { types: ['small'], quantity: 'single' });
        productDecorators.variationAttributes(product, variationsPLI, {
            attributes: 'selected'
        });

        orderItem.productName = product.productName;  // eslint-disable-line no-param-reassign
        orderItem.variationAttributes = product.variationAttributes; // eslint-disable-line no-param-reassign
        orderItem.images = product.images; // eslint-disable-line no-param-reassign
        orderItem.cost = orderItem.cost || orderItem.price * orderItem.quantity; // eslint-disable-line no-param-reassign
        orderItem.totalPrice = utilHelpers.formatMoney(orderItem.totalPrice, currencyCode); // eslint-disable-line no-param-reassign
        orderItem.totalOrigPrice = orderItem.totalOrigPrice ? utilHelpers.formatMoney(orderItem.totalOrigPrice, currencyCode) : utilHelpers.formatMoney(orderItem.cost, currencyCode); // eslint-disable-line no-param-reassign
        orderItem.nonRMA = nonRMA; // eslint-disable-line no-param-reassign
        orderItem.quantityAvailableToReturn = orderItem.nonRMA ? 0 : orderItem.quantityAvailableToReturn; // eslint-disable-line no-param-reassign
    }
};

/**
 * get products information from eCom
 * @param {Object} orderItems - list ordered items
 * @param {Object} currencyCode - currency code
 * @returns {Array} an array of the product items
 */
base.getProductItems = function getProductItems(orderItems, currencyCode) {
    var items = [];
    orderItems.forEach(function (orderItem) {
        if (orderItem.quantity > 0) {
            // Getting product attributes from eCom since these information is not available in SOM
            base.addProductData(orderItem, currencyCode);
            items.push(orderItem);
        }
    });
    return items;
};

module.exports = base;
