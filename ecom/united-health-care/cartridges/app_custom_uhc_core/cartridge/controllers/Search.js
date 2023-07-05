'use strict';

/**
 * @namespace Search
 */

var server = require('server');
server.extend(module.superModule);

var cache = require('*/cartridge/scripts/middleware/cache');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var pageMetaData = require('*/cartridge/scripts/middleware/pageMetaData');

server.prepend('Show', cache.applyShortPromotionSensitiveCache, consentTracking.consent, function (req, res, next) {
    var cgid = req.querystring.cgid;
    var CatalogMgr = require('dw/catalog/CatalogMgr');
    var URLUtils = require('dw/web/URLUtils');
    var adobeDataLayer = require('*/cartridge/scripts/datalayer.js');
    var currentCategory = CatalogMgr.getCategory(cgid);
    var viewData = {};
    viewData.adobeDataLayer = {};
    viewData.adobeDataLayer.PageGroup = adobeDataLayer.pageTypes.SEARCH;
    viewData.adobeDataLayer.PageName = req.pageMetaData.title;
    viewData.adobeDataLayer.Context = adobeDataLayer.CONTEXT.GLOBAL;
    if (currentCategory && !empty(currentCategory.custom.cid)) {
        var ContentMgr = require('dw/content/ContentMgr');
        var folderID = currentCategory.custom.cid;
        var folder = ContentMgr.getFolder(folderID);
        var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');

        if (folder) {
            viewData.content = folder.content;
            pageMetaHelper.setPageMetaData(req.pageMetaData, folder);
            pageMetaHelper.setPageMetaTags(req.pageMetaData, folder);
            if (folder.subFolders) {
                viewData.subFolders = folder.subFolders;
            } else {
                viewData.subFolders = [];
            }

            if (folder.parent && folder.parent.ID !== 'root') {
                viewData.parentDescription = folder.parent.getDescription();
                viewData.parentDisplayName = folder.parent.getDisplayName();
            }

            viewData.displayName = folder.getDisplayName();
            viewData.description = folder.getDescription();
            viewData.adobeDataLayer = {};
            viewData.adobeDataLayer.PageGroup = adobeDataLayer.pageTypes.CONTENT;
            viewData.adobeDataLayer.PageName = req.pageMetaData.title;
            viewData.adobeDataLayer.Context = adobeDataLayer.CONTEXT.GLOBAL;

            var sections = {};
            sections.section2 = folder.parent && folder.parent.ID !== 'root' ? folder.parent.ID : '';
            sections.section3 = '';
            sections.section4 = '';
            viewData.adobeDataLayer.sections = sections;
            res.setViewData(viewData);
            if (!empty(folder.template)) {
                res.render(folder.template);
            } else {
                res.redirect(URLUtils.url('Home-Show'));
            }
            this.emit('route:Complete', req, res);
            return;
        }
        res.redirect(URLUtils.url('Home-Show'));
        this.emit('route:Complete', req, res);
        return;
    }
    res.setViewData(viewData);
    next();
}, pageMetaData.computedPageMetaData);

/**
 * Search-Category : This endpoint is called sub Category
 * @name Base/Search-Category
 * @function
 * @memberof Search
 * @param {middleware} - cache.applyDefaultCache
 * @param {querystringparameter} - cgid - the query string a shopper is searching for
 * @param {category} - non-sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('Category', cache.applyDefaultCache, function (req, res, next) {
    var CatalogMgr = require('dw/catalog/CatalogMgr');
    var cgid = req.querystring.cgid;
    var category = CatalogMgr.getCategory(cgid);
    var subCategories = category && category.onlineSubCategories ? category.onlineSubCategories.iterator().asList() : null;
    res.render('search/categorylinks', {
        subCategories: subCategories
    });
    next();
});


/**
 * Search-DisplayVideo : This endpoint is called for displaying resources Videos
 * @name Base/Search-DisplayVideo
 * @function
 * @memberof Search
 * @param {middleware} - cache.applyDefaultCache
 * @param {middleware} - consentTracking.consent
 * @param {querystringparameter} - videoID
 * @param {querystringparameter} - videoName
 * @param {category} - non-sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('DisplayVideo', cache.applyDefaultCache, consentTracking.consent, function (req, res, next) {
    var URLUtils = require('dw/web/URLUtils');
    try {
        var preferences = require('*/cartridge/config/preferences.js');
        var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
        let adobeDataLayer = require('*/cartridge/scripts/datalayer.js');
        var videoID = req.querystring.videoID;
        var videocid = req.querystring.videocid;
        var ContentMgr = require('dw/content/ContentMgr');
        var content = ContentMgr.getContent(videocid);
        pageMetaHelper.setPageMetaData(req.pageMetaData, content);
        pageMetaHelper.setPageMetaTags(req.pageMetaData, content);
        var adobeDataLayerObj = {};
        adobeDataLayerObj.PageGroup = adobeDataLayer.pageTypes.CONTENT;
        adobeDataLayerObj.PageName = req.querystring.videocid;
        adobeDataLayerObj.Context = adobeDataLayer.CONTEXT.GLOBAL;

        if (!content) {
            throw new Error('assest not found');
        }
        var sections = {};
        sections.section2 = '';
        sections.section3 = '';
        if (content.folders.length > 0) {
            var contentFolder = content.folders[0];
            sections.section2 = contentFolder.parent && contentFolder.parent.ID !== 'root' ? contentFolder.parent.ID : contentFolder.ID;
            sections.section3 = contentFolder.ID;
        }
        sections.section4 = content.ID;
        adobeDataLayerObj.sections = sections;
        var resourcesVideoURL = preferences.resourcesVideoURL;
        if (!empty(resourcesVideoURL)) {
            resourcesVideoURL = resourcesVideoURL.replace('videoID', videoID);
        }
        if (videoID) {
            res.render('search/displayVideo', {
                videoName: content ? content.getName() : '',
                description: content ? content.getDescription() : '',
                resourcesVideoURL: resourcesVideoURL,
                adobeDataLayer: adobeDataLayerObj
            });
        } else {
            res.redirect(URLUtils.url('Home-Show'));
        }
    } catch (error) {
        var url = URLUtils.https('Home-Show');
        res.redirect(url);
    }

    next();
}, pageMetaData.computedPageMetaData);

/**
 * Search-DisplayPrice : A Remote Include for getting sesssion basd prices for the products
 * @name Base/Search-DisplayPrice
 * @function
 * @memberof Search
 * @param {querystringparameter} - productIds
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('DisplayPrice', function (req, res, next) {
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
            if (customer.authenticated || product.isAccessories || product.isSupplies) {
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
