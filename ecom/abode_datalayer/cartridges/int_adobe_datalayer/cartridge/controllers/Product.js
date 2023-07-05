'use strict';

var server = require('server');
server.extend(module.superModule);

var preferences = require('*/cartridge/config/preferences.js');

/**
 * Implementation of abobe datalayer for Product page
 */
server.prepend('Show', function (req, res, next) {
    if (preferences.enableAdobeDataLayer) {
        var sections = {};
        sections.section2 = '';
        sections.section3 = '';
        sections.section4 = '';
        var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
        var adobeDataLayer = require('*/cartridge/scripts/datalayer.js');
        var ProductMgr = require('dw/catalog/ProductMgr');
        var apiProduct = ProductMgr.getProduct(req.querystring.pid);
        var productType = productHelper.getProductType(apiProduct);
        var pageTitle = req.pageMetaData.title;
        if (!apiProduct.online && productType !== 'set' && productType !== 'bundle') {
            var viewData = res.getViewData();
            viewData.adobeDataLayer = {};
            viewData.adobeDataLayer.PageGroup = adobeDataLayer.pageTypes.ERROR;
            viewData.adobeDataLayer.PageName = '';
            if (pageTitle) {
                pageTitle = pageTitle.replace(/&/g, 'and');
                pageTitle = pageTitle.replace(/™/g, ' TM');
                pageTitle = pageTitle.replace(/®/g, ' R');
                viewData.adobeDataLayer.PageName = req.querystring.pid + ':' + pageTitle;
            }
            viewData.adobeDataLayer.isErrorPage = true;
            viewData.adobeDataLayer.sections = sections;
            res.setStatusCode(404);
            res.render('error/notFound', {
                adobeDataLayer: viewData.adobeDataLayer
            });
        }
    }
    next();
});

/**
 * Implementation of abobe datalayer for Product page
 */
server.append('Show', function (req, res, next) {
    if (preferences.enableAdobeDataLayer) {
        var sections = {};
        sections.section2 = '';
        sections.section3 = '';
        sections.section4 = '';
        var adobeDataLayer = require('*/cartridge/scripts/datalayer.js');

        var viewData = res.getViewData();
        var pageTitle = req.pageMetaData.title;
        var adobeDataLayerObj = {};
        if (viewData.product) {
            adobeDataLayerObj.PageGroup = adobeDataLayer.pageTypes.PRODUCT_DETAIL_PAGE;
            adobeDataLayerObj.PageName = '';
            if (pageTitle) {
                pageTitle = pageTitle.replace(/&/g, 'and');
                pageTitle = pageTitle.replace(/™/g, ' TM');
                pageTitle = pageTitle.replace(/®/g, ' R');
                adobeDataLayerObj.PageName = req.querystring.pid + ':' + pageTitle;
            }
            adobeDataLayerObj.Context = adobeDataLayer.CONTEXT.GLOBAL;
            sections.section2 = viewData.breadcrumbs.length > 0 ? viewData.breadcrumbs[0].htmlValue : '';
            sections.section3 = viewData.breadcrumbs.length > 0 ? viewData.breadcrumbs[1].htmlValue : '';
            sections.section4 = viewData.breadcrumbs.length > 0 && viewData.breadcrumbs[2] ? viewData.breadcrumbs[2].htmlValue : '';
            adobeDataLayerObj.sections = sections;
        }
        viewData.adobeDataLayer = adobeDataLayerObj;
        res.setViewData(viewData);
    }
    next();
});

module.exports = server.exports();
