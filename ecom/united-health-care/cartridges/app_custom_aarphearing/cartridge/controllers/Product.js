'use strict';

var server = require('server');
server.extend(module.superModule);

/**
 * Product-DisplayPrice : A Remote Include for getting sesssion basd prices for the products
 * @name Base/Product-DisplayPrice
 * @function
 * @memberof Search
 * @param {querystringparameter} - pid
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.replace('DisplayPrice', function (req, res, next) {
    var ProductMgr = require('dw/catalog/ProductMgr');
    var Resource = require('dw/web/Resource');
    var URLUtils = require('dw/web/URLUtils');
    var decorators = require('*/cartridge/models/product/decorators/index');
    var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
    var preferences = require('*/cartridge/config/preferences.js');

    var pid = req.querystring.pid;
    var addToCartUrl = req.querystring.addToCartUrl;
    var addToCartText = Resource.msg('button.addtocart', 'common', null);
    var isTypeButton = true;
    var product = {};
    var informationMessageAssetID;

    var customerVerified = false;
    if (session.privacy.customerType === 'AARPVerified' || (session.privacy.AARP_Member && session.privacy.AARP_Member === 'true')) {
        customerVerified = true;
    }

    var apiProduct = ProductMgr.getProduct(pid);

    if (apiProduct) {
        decorators.custom(product, apiProduct);
        var options = productHelper.getConfig(apiProduct, req.querystring);
        decorators.base(product, apiProduct, options.productType);
        decorators.readyToOrder(product, options.variationModel);
        decorators.availability(product, options.quantity, apiProduct.minOrderQuantity.value, apiProduct.availabilityModel);

        if (product.isAccessories || product.isSupplies) {
            decorators.price(product, apiProduct, options.promotions, false, options.optionModel);
        } else if (!customer.authenticated && product.isOTCProduct) {
            addToCartUrl = URLUtils.https('Login-OAuthLogin', 'oauthLoginTargetEndPoint', 8, 'pid', pid);
            addToCartText = Resource.msg('link.header.login', 'account', null);
            isTypeButton = false;
            informationMessageAssetID = 'pdp-sign-in-text';
        } else if (!customer.authenticated && product.isPrescriptionProduct) {
            decorators.price(product, apiProduct, options.promotions, false, options.optionModel);
            addToCartUrl = URLUtils.https('Login-OAuthLogin', 'oauthLoginTargetEndPoint', 8, 'pid', pid);
            addToCartText = Resource.msg('link.header.login', 'account', null);
            isTypeButton = false;
            informationMessageAssetID = 'pdp-sign-in-text';
        } else if (customer.authenticated && product.isOTCProduct) {
            decorators.price(product, apiProduct, options.promotions, false, options.optionModel);
            informationMessageAssetID = 'pdp-OTC-product-text';
        } else if (customer.authenticated && !preferences.enableTraditionalProduct && product.isPrescriptionProduct) {
            decorators.price(product, apiProduct, options.promotions, false, options.optionModel);
            addToCartUrl = URLUtils.https('ProviderSearch-Show');
            addToCartText = Resource.msg('label.button.findaprovider', 'product', null);
            isTypeButton = false;
            informationMessageAssetID = customerVerified ? 'pdp-traditional-product-text-verified' : 'pdp-traditional-product-text-not-verified';
        } else if (customer.authenticated && preferences.enableTraditionalProduct && product.isPrescriptionProduct) {
            decorators.price(product, apiProduct, options.promotions, false, options.optionModel);
            informationMessageAssetID = customerVerified ? 'pdp-traditional-product-text-verified' : 'pdp-traditional-product-text-not-verified';
        }
    }
    res.render('product/components/displayCustomPriceAndButton', {
        product: product,
        addToCartUrl: addToCartUrl,
        addToCartText: addToCartText,
        isTypeButton: isTypeButton,
        informationMessageAssetID: informationMessageAssetID
    });
    next();
});

module.exports = server.exports();
