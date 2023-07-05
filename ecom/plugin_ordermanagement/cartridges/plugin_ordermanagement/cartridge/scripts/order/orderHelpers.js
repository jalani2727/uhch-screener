'use strict';

var Logger = require('dw/system/Logger');
var Resource = require('dw/web/Resource');
var URLUtils = require('dw/web/URLUtils');
var ProductMgr = require('dw/catalog/ProductMgr');

var som = require('*/cartridge/scripts/som');
var somHelper = require('*/cartridge/scripts/helpers/somHelpers');
var somPreferences = require('*/cartridge/config/somPreferences');
var SomOrderModel = require('*/cartridge/models/somOrder');

var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
var utilHelpers = require('*/cartridge/scripts/helpers/utilHelpers');
var productDecorators = require('*/cartridge/models/product/decorators/index');


/**
 * Get Order fulfillment status
 * @param {Object} OrderModel - an object of the customer order
 * @returns {string} fulfillment status
 */
function getFulfillmentStatus(OrderModel) {
    var fulfillmentStatus = '';
    if (OrderModel.orderedStatusGroupItems.length > 0) {
        fulfillmentStatus = somPreferences.statusOrdered;
    } else if (OrderModel.inProgressStatusGroupItems.length > 0) {
        fulfillmentStatus = somPreferences.statusInProgress;
    } else if (OrderModel.shippedStatusGroupItems.length > 0) {
        fulfillmentStatus = somPreferences.statusShipped;
    }
    return fulfillmentStatus;
}

/**
 * Split ordered items by type
 * @param {Object} somApiOrder - response object from SOM
 * @returns {Array} returns product lists grouped by type
 */
function splitDeliveryItems(somApiOrder) {
    var items = {
        Product: [],
        Other: []
    };
    for (var i = 0; i < somApiOrder.OrderItemSummaries.records.length; i++) {
        var item = somApiOrder.OrderItemSummaries.records[i];
        // TODO: change delivery recognise
        if (item.TypeCode === 'Product') {
            items.Product.push(item);
        } else {
            items.Other.push(item);
        }
    }
    return items;
}

/**
 * Returns a list of order models for the current customer based on response from SOM.
 * the response is assumed to contain the following elements in the following order
 * 0 - OrderSummaries
 * 1 - FulfillmentOrders
 * 2 - paymentMethod
 * [3] - [account]
 * [4] - [delivery]
 * [5] - [shipment]
 * @param {Object} somApiResponse - response object from SOM
 * @returns {Object} - Object with an array of order models
 */
function createOrderModels(somApiResponse) {
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

            if (compositeResponses.compositeResponse[3] && compositeResponses.compositeResponse[3].body.records[i]) {
                somApiOrder.Account = compositeResponses.compositeResponse[3].body.records[i];
            }
            if (compositeResponses.compositeResponse[4] && compositeResponses.compositeResponse[4].body.records[i]) {
                somApiOrder.DeliveryMethod = compositeResponses.compositeResponse[4].body.records[i];
            }

            somApiOrder.OrderItemGrouped = splitDeliveryItems(somApiOrder);
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
}

/**
 * Get Order Summary Responce by orderNumber
 * @param {string} orderNumber - The order number for the order
 * @returns {Object} an object of the customer's last order
 */
function getOrderSummary(orderNumber) {
    var OrderModel = {};
    var somApiResponse = som.getOrdersSummary([orderNumber]);
    if (somApiResponse && somApiResponse.ok) {
        OrderModel = createOrderModels(somApiResponse)[0];
        OrderModel.fulfillmentStatus = getFulfillmentStatus(OrderModel);
    } else {
        Logger.error('Error getting orders from SOM in getOrderDetails. \n ' + JSON.stringify(somApiResponse, null, 4));
    }
    return OrderModel;
}

/**
 * Creates an order model for the current customer
 * @param {Object} req - the request object
 * @returns {Object} an object of the customer's last order
 */
function getLastOrder(req) {
    var orderModel = null;
    var somApiResponse = som.getLastOrder(req.currentCustomer.raw);

    var compositeResponses = null;
    if (somApiResponse && somApiResponse.ok) {
        compositeResponses = somApiResponse.object.responseObj;
    } else {
        Logger.error('Error getting last order from SOM. \n ' + JSON.stringify(somApiResponse, null, 4));
    }

    // If there is an order
    if (compositeResponses && compositeResponses.compositeResponse[0].body.records.length > 0) {
        // Create the OrderSummary to FulfillmentOrders map
        var somApiFulfillmentOrders = compositeResponses.compositeResponse[1];
        var orderSummaryToFulfillmentMap = null;
        orderSummaryToFulfillmentMap = somHelper.createFulfillmentOrderMapObjects(somApiFulfillmentOrders, orderSummaryToFulfillmentMap);

        // create Order Summary Map Objects
        var somApiOrders = compositeResponses.compositeResponse[0];
        var somApiOrder = somApiOrders.body.records[0];

        somApiOrder.OrderItemGrouped = splitDeliveryItems(somApiOrder);
        somApiOrder.OrderItemSummaries.records = somApiOrder.OrderItemGrouped.Product;
        somApiOrder.OrderItemSummaries.totalSize = somApiOrder.OrderItemGrouped.Product.length;

        var orderSummaryMap = somHelper.createOrderSummaryMapObjects(somApiOrders);

        orderModel = new SomOrderModel(
            somApiOrder,
            orderSummaryMap.orderSummaryToOrderItemSummaries,
            orderSummaryToFulfillmentMap.orderSummaryToFulfillmentOrders
        );
    }

    return orderModel;
}

/**
 * Returns a filters object used in a som query,
 * @param {Object} queryString - object of query string parameters
 *                   expected properties off of queryString are
 *                   filterUnit - unit of time eg days, weeks, etc
 *                   filterValue - is the number of times the filterUnit needs to be multiplied
 *                                 if the parameter queryString.filterUnit = 'all' an empty object is returned
 *                   filterYear - the year to use for querying orders
 * @returns {Object} - Returns a filters object used in a som query
 * */
function getFilters(queryString) {
    var returnObj = {};

    if (!somPreferences || !somPreferences.filters || !somPreferences.filters[0] || !queryString) {
        return returnObj;
    }

    var defaultFilter = somPreferences && somPreferences.filters[0] ? somPreferences.filters[0] : [];
    var filterUnit = queryString && queryString.filterUnit ? queryString.filterUnit : defaultFilter.filterName;
    var filterMultplier = queryString && queryString.filterValue ? queryString.filterValue : defaultFilter.multiplier;
    var getAllFilter = filterUnit === 'all';
    var filterYear = 0;
    if (filterUnit === 'year' || queryString.filterYear) {
        filterYear = queryString && queryString.filterYear ? queryString.filterYear : somPreferences.filters[0].multiplier;
    }
    var filterUnitValue = 0;
    var offsetValue = 0;

    if (filterUnit && filterYear === 0 && !getAllFilter) {
        switch (filterUnit) {
            case 'days':
                filterUnitValue = somPreferences.filterUnits.days;
                break;
            case 'weeks':
                filterUnitValue = somPreferences.filterUnits.weeks;
                break;
            case 'months':
                filterUnitValue = somPreferences.filterUnits.months;
                break;
            case 'years':
                filterUnitValue = somPreferences.filterUnits.years;
                break;
            default :
                return returnObj;
        }
    }

    if (filterUnitValue && !getAllFilter) {
        offsetValue = filterUnitValue * filterMultplier;
        var today = new Date();
        var newDate = Date.parse(today) - offsetValue;
        var offsetDate = new Date(newDate);
        var day = offsetDate.getDate();
        var month = offsetDate.getMonth();
        var updatedMonth = (month < 10 ? '0' : '') + (month + 1);
        updatedMonth = updatedMonth.length > 2 ? updatedMonth.substring(1) : updatedMonth;

        var dateStr = '' + offsetDate.getFullYear() + '-' + updatedMonth + '-' + (day < 10 ? '0' : '') + day + 'T00:00:00.000Z';
        returnObj.fromDate = dateStr;
    } else if (filterYear && !getAllFilter) {
        returnObj.year = filterYear;
    }

    return returnObj;
}

/**
 * Returns a list of orders for the current customer with filters values
 * @param {Object} currentCustomer - object with customer properties
 * @param {Object} queryString - object of query string parameters
 * @returns {Object} - Object with an array of order models and filters
 * */
function getOrders(currentCustomer, queryString) {
    var orders = [];
    var filters = getFilters(queryString);

    var somApiResponse = som.getOrders(currentCustomer.raw, filters);

    if (somApiResponse.ok) {
        orders = createOrderModels(somApiResponse);
    } else {
        Logger.error('Error getting orders from SOM. \n ' + JSON.stringify(somApiResponse, null, 4));
    }

    return {
        orders: orders,
        filterValues: somPreferences.filters ? somPreferences.filters : []
    };
}

/**
 * Creates a SOM order model for order detail page
 * @param {Object} req - the request object
 * @returns {Object} an object of the som order model
 */
function getOrderDetails(req) {
    var somApiResponse = som.getOrderAndFulfillment(req.querystring.orderSummaryId, req.querystring.fulfillmentId);

    var orders = null;
    var orderModel = null;

    if (somApiResponse && somApiResponse.ok) {
        orders = createOrderModels(somApiResponse);
        if (orders && orders.length) {
            orderModel = orders[0];
        }
        orderModel.fulfillmentStatus = getFulfillmentStatus(orderModel);
        return orderModel;
    }
    Logger.error('Error getting orders from SOM in getOrderDetails. \n ' + JSON.stringify(somApiResponse, null, 4));

    return orderModel;
}

/**
 * execute preview som cancel request
 * @param {Object} cancelData - data for cancel ordered items
 * @returns {Object} an object of the customer's order
 */
function preCancelOrderItems(cancelData) {
    var res = som.preCancelOrderItems(cancelData);
    return res;
}

/**
 * execute som cancel request
 * @param {Object} cancelData - data for cancel ordered items
 * @returns {Object} an object of the customer's order
 */
function cancelOrderItems(cancelData) {
    var res = som.cancelOrderItems(cancelData);
    return res;
}

/**
 * Checking for non-returnable items
 * @param {Array} orderItems - sfcc OrderItems for check attributes
 * @returns {boolean} result of checking
 */
function isNonRMA(orderItems) {
    var haveNonRMA = false;
    orderItems.forEach(function (item) {
        if (item.nonRMA) {
            haveNonRMA = true;
        }
    });
    return haveNonRMA;
}

/**
 * execute preview som return request
 * @param {Object} returnData - data for cancel ordered items
 * @param {Array} orderItems - sfcc OrderItems for check attributes
 * @returns {Object} an object of the customer's order
 */
function preReturnOrderItems(returnData, orderItems) {
    var res;
    if (!isNonRMA(orderItems)) {
        res = som.preReturnOrderItems(returnData);
    }
    return res;
}

/**
 * execute som return request
 * @param {Object} returnData - data for cancel ordered items
 * @param {Array} orderItems - sfcc OrderItems for check attributes
 * @returns {Object} an object of the customer's order
 */
function returnOrderItems(returnData, orderItems) {
    var res;
    if (!isNonRMA(orderItems)) {
        res = som.returnOrderItems(returnData);
    }
    return res;
}

/**
 * add product information from eCom
 * @param {Object} orderItem - ordered item
 * @param {Object} currencyCode - currency code
 */
function addProductData(orderItem, currencyCode) {
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
        orderItem.totalPrice = utilHelpers.formatMoney(orderItem.cost, currencyCode); // eslint-disable-line no-param-reassign
        orderItem.nonRMA = nonRMA; // eslint-disable-line no-param-reassign
        orderItem.quantityAvailableToReturn = orderItem.nonRMA ? 0 : orderItem.quantityAvailableToReturn; // eslint-disable-line no-param-reassign
    }
}

/**
 * get products information from eCom
 * @param {Object} orderItems - list ordered items
 * @param {Object} currencyCode - currency code
 * @returns {Array} an array of the product items
 */
function getProductItems(orderItems, currencyCode) {
    var items = [];
    orderItems.forEach(function (orderItem) {
        if (orderItem.quantity > 0) {
            // Getting product attributes from eCom since these information is not available in SOM
            addProductData(orderItem, currencyCode);
            items.push(orderItem);
        }
    });
    return items;
}

/**
 * get bredcrumbs for action
 * @param {string} action - action name
 * @param {boolean} [authorized] - is authorized flag
 * @param {Object} [req] - requst object
 * @returns {Array} an array of the Breadcrumbs
 */
function getBreadcrumbs(action, authorized, req) {
    var breadcrumbs = [{
        htmlValue: Resource.msg('global.home', 'common', null),
        url: URLUtils.home().toString()
    }];
    if (authorized) {
        breadcrumbs.push({
            htmlValue: Resource.msg('page.title.myaccount', 'account', null),
            url: URLUtils.https('Account-Show').toString()
        });

        if (['Cancel', 'Return'].indexOf(action) !== -1 && req && req.querystring && req.querystring.orderFilter) {
            breadcrumbs.push({
                htmlValue: Resource.msg('label.orderhistory', 'account', null),
                url: URLUtils.https('Order-History', 'orderFilter', req.querystring.orderFilter).toString()
            });
        } else if (['Details', 'Cancel', 'Return', 'CancelSuccess', 'ReturnSuccess'].indexOf(action) !== -1) {
            breadcrumbs.push({
                htmlValue: Resource.msg('label.orderhistory', 'account', null),
                url: URLUtils.https('Order-History').toString()
            });
        }
    } else {
        breadcrumbs.push({
            htmlValue: Resource.msg('heading.order.page', 'order', null),
            url: URLUtils.https('Login-Show').toString()
        });

        if (['Details', 'Cancel', 'CancelSuccess', 'Return', 'ReturnSuccess'].indexOf(action) !== -1) {
            breadcrumbs.push({
                htmlValue: Resource.msg('label.orderhistory', 'account', null),
                url: URLUtils.https('Order-GuestDetails')
            });
        }
    }
    return breadcrumbs;
}

module.exports = {
    getLastOrder: getLastOrder,
    getOrderSummary: getOrderSummary,
    getOrders: getOrders,
    createOrderModels: createOrderModels,
    getOrderDetails: getOrderDetails,
    getFilters: getFilters,
    preCancelOrderItems: preCancelOrderItems,
    cancelOrderItems: cancelOrderItems,
    preReturnOrderItems: preReturnOrderItems,
    returnOrderItems: returnOrderItems,
    getProductItems: getProductItems,
    addProductData: addProductData,
    getBreadcrumbs: getBreadcrumbs,
    isNonRMA: isNonRMA,
    getFulfillmentStatus: getFulfillmentStatus,
    splitDeliveryItems: splitDeliveryItems
};
