'use strict';

var base = module.superModule;

var HookMgr = require('dw/system/HookMgr');
var HashMap = require('dw/util/HashMap');
var Resource = require('dw/web/Resource');

/**
 * Sends a confirmation to the current user
 * @param {dw.order.Order} order - The current user's order
 * @param {string} locale - the current request's locale id
 * @returns {void}
 */
base.sendConfirmationEmail = function (order, locale) {
    var OrderModel = require('*/cartridge/models/order');
    var Locale = require('dw/util/Locale');
    var Logger = require('dw/system/Logger');
    var Template = require('dw/util/Template');
    var Site = require('dw/system/Site');

    var context = new HashMap();
    var currentLocale = Locale.getLocale(locale);

    var orderModel = new OrderModel(order, { countryCode: currentLocale.country, containerView: 'order' });

    var orderObject = { order: orderModel };

    Object.keys(orderObject).forEach(function (key) {
        context.put(key, orderObject[key]);
    });
    var template = new Template('checkout/confirmation/confirmationEmail');
    var content = template.render(context).text;

    // Set Order for hook compat
    context.put('Order', order);

    // Set extra param, CurrentLocale
    context.put('CurrentLocale', currentLocale);
    var hookID = 'app.mail.sendMail';
    if (HookMgr.hasHook(hookID)) {
        HookMgr.callHook(
            hookID,
            'sendMail',
            {
                communicationHookID: 'order.confirmation',
                template: 'checkout/confirmation/confirmationEmail',
                fromEmail: Site.current.getCustomPreferenceValue('customerServiceEmail') || 'no-reply@salesforce.com',
                toEmail: order.customerEmail,
                subject: Resource.msg('subject.order.confirmation.email', 'order', null),
                messageBody: content,
                params: context
            }
        );
    } else {
        Logger.error('No hook registered for {0}', hookID);
    }
};

module.exports = base;
