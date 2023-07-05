'use strict';

var server = require('server');
server.extend(module.superModule);

/**
  * Product-Show : This endpoint is called to show the details of the selected product
  * @name Base/Product-Show
  * @function
  * @memberof Product
  * @param {serverfunction} - append
  */
server.append('Show', function (req, res, next) {
    var viewData = res.getViewData();
    var preferences = require('*/cartridge/config/preferences.js');
    viewData.isTraditionalProductEnabled = preferences.enableTraditionalProduct;
    next();
});

/**
 * Product-DisplayPrice : A Remote Include for getting sesssion basd prices for the products
 * @name Base/Product-DisplayPrice
 * @function
 * @memberof Search
 * @param {querystringparameter} - pid
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('DisplayPrice', function (req, res, next) {
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

    var apiProduct = ProductMgr.getProduct(pid);
    var UHCCustomer = session.privacy.customerType === 'UHCVerified' || session.privacy.customerType === 'UHCNotVerified';

    if (apiProduct) {
        decorators.custom(product, apiProduct);
        var options = productHelper.getConfig(apiProduct, req.querystring);
        decorators.base(product, apiProduct, options.productType);
        decorators.readyToOrder(product, options.variationModel);
        decorators.availability(product, options.quantity, apiProduct.minOrderQuantity.value, apiProduct.availabilityModel);

        if (product.isAccessories || product.isSupplies) {
            decorators.price(product, apiProduct, options.promotions, false, options.optionModel);
        } else if (!customer.authenticated && (product.isPrescriptionProduct || product.isOTCProduct)) {
            addToCartUrl = URLUtils.https('Login-OAuthLogin', 'oauthLoginTargetEndPoint', 8, 'pid', pid);
            addToCartText = Resource.msg('link.header.login', 'account', null);
            isTypeButton = false;
            informationMessageAssetID = 'pdp-sign-in-text';
        } else if (customer.authenticated && product.isOTCProduct) {
            decorators.price(product, apiProduct, options.promotions, false, options.optionModel);
            informationMessageAssetID = UHCCustomer ? 'pdp-OTC-product-text' : 'pdp-OTC-product-text-no-insurance';
        } else if (customer.authenticated && !preferences.enableTraditionalProduct && product.isPrescriptionProduct) {
            decorators.price(product, apiProduct, options.promotions, false, options.optionModel);
            addToCartUrl = URLUtils.https('ProviderSearch-Show');
            addToCartText = Resource.msg('label.button.findaprovider', 'product', null);
            isTypeButton = false;
            informationMessageAssetID = UHCCustomer ? 'pdp-traditional-product-text' : '';
        } else if (customer.authenticated && preferences.enableTraditionalProduct && product.isPrescriptionProduct) {
            decorators.price(product, apiProduct, options.promotions, false, options.optionModel);
            informationMessageAssetID = UHCCustomer ? 'pdp-traditional-product-text' : '';
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
