'use strict';

var OrderMgr = require('dw/order/OrderMgr');
var Order = require('dw/order/Order');
var Transaction = require('dw/system/Transaction');
var Logger = require('dw/system/Logger');

/**
 * Job to verify the UPG payment status and based on thet
 * fail or confirm the order.
 *
 */
function execute() {
    try {
        Logger.info('UPG Order Processing Job Started');

        var previousDay = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
        var queryString = 'creationDate <= {0} AND status = {1}';
        var orderIterator = OrderMgr.searchOrders(queryString, 'orderNo asc', previousDay, Order.ORDER_STATUS_CREATED);

        Logger.info(orderIterator.count + ': Order Processed');

        if (orderIterator.count > 0) {
            while (orderIterator.hasNext()) {
                var order = orderIterator.next();

                Logger.info(order.getOrderNo() + ': Order Number Start Processing');
                if (order.custom.upgTransactionId !== '') {
                    var upgTransactionId = order.custom.upgTransactionId;
                    var upgServiceHelper = require('*/cartridge/scripts/helpers/upgServiceHelper');
                    var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
                    var transactionDetail = upgServiceHelper.getFindService(upgTransactionId);
                    COHelpers.addOrderNotes(order, transactionDetail);
                    if (transactionDetail && transactionDetail.error) {
                        // eslint-disable-next-line no-loop-func
                        Transaction.wrap(function () { OrderMgr.failOrder(order, true); });

                        Logger.info(order.getOrderNo() + ': Order Number Fail, Find service had not confirmed the Transaction Id');

                        // eslint-disable-next-line no-continue
                        continue;
                    }
                    var handlePaymentResult = COHelpers.handlePayments(order, order.orderNo, transactionDetail);
                    if (handlePaymentResult.error) {
                        // eslint-disable-next-line no-loop-func
                        Transaction.wrap(function () { OrderMgr.failOrder(order, true); });

                        Logger.info(order.getOrderNo() + ': Order Number Fail');

                        // eslint-disable-next-line no-continue
                        continue;
                    }
                    var placeOrderResult = COHelpers.placeOrder(order);

                    Logger.info(order.getOrderNo() + ': Order Placed Successfully');

                    if (!placeOrderResult.error) {
                        if (order.getCustomerEmail()) {
                            // need to check the locale
                            COHelpers.sendConfirmationEmail(order, 'default');
                        }
                    }
                } else {
                    Logger.info(order.getOrderNo() + ': Order Number Transaction id not found');
                }
            }
        }

        Logger.info('UPG Order Processing Job Completed');
    } catch (error) {
        Logger.error('error while executing the UPG Order Process job');
    }
}

module.exports.execute = execute;
