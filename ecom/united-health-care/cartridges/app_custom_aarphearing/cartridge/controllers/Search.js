'use strict';

/**
 * @namespace Search
 */

var server = require('server');
server.extend(module.superModule);

/**
 * Search-DisplayPrice : A Remote Include for getting sesssion basd prices for the products
 * @name Base/Search-DisplayPrice
 * @function
 * @memberof Search
 * @param {querystringparameter} - productIds
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.replace('DisplayPrice', function (req, res, next) {
    var productIds = JSON.parse(req.querystring.productIds);
    var priceObject = {};
    productIds.forEach(function (productObj) {
        var decorators = require('*/cartridge/models/product/decorators/index');
        var ProductMgr = require('dw/catalog/ProductMgr');
        var pid = productObj.productID;
        var apiProduct = ProductMgr.getProduct(pid);
        var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
        var product = {};
        if (apiProduct) {
            decorators.custom(product, apiProduct);
            if (customer.authenticated || product.isAccessories || product.isSupplies || product.isPrescriptionProduct) {
                var options = productHelper.getConfig(apiProduct, req.querystring);
                decorators.price(product, apiProduct, options.promotions, false, options.optionModel);
                priceObject[pid] = product.price;
            } else {
                var obj = {};
                var Resource = require('dw/web/Resource');
                obj.signInMessage = Resource.msg('search.signin.message', 'search', null);
                product.signInMessage = obj;
                priceObject[pid] = product.signInMessage;
            }
        }
    });
    res.render('search/searchPrice', {
        priceObj: priceObject
    });
    next();
});

module.exports = server.exports();
