'use strict';

var server = require('server');
server.extend(module.superModule);
var preferences = require('*/cartridge/config/preferences.js');

/**
 * Implementation of abobe datalayer for Content page
 */
server.append('Show', function (req, res, next) {
    if (preferences.enableAdobeDataLayer) {
        var viewData = res.getViewData();
        let adobeDataLayer = require('*/cartridge/scripts/datalayer.js');
        viewData.adobeDataLayer = {};
        viewData.adobeDataLayer.PageGroup = adobeDataLayer.pageTypes.CONTENT;
        viewData.adobeDataLayer.PageName = req.pageMetaData.title;
        viewData.adobeDataLayer.Context = adobeDataLayer.CONTEXT.GLOBAL;
        var sections = {};
        sections.section2 = '';
        if (viewData.content) {
            var catalogMgr = require('dw/catalog/CatalogMgr');
            var category = catalogMgr.getCategory(viewData.content.ID);
            if (category && category.parent && category.parent.ID !== 'root') {
                sections.section2 = category.parent.displayName.toLowerCase();
            }
        }
        sections.section3 = '';
        sections.section4 = '';
        viewData.adobeDataLayer.sections = sections;
    }
    next();
});

module.exports = server.exports();
