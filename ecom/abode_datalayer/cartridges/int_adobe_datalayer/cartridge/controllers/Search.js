'use strict';

var server = require('server');
server.extend(module.superModule);
var preferences = require('*/cartridge/config/preferences.js');

/**
 * Implementation of abobe datalayer for Search page
 */
server.append('Show', function (req, res, next) {
    if (preferences.enableAdobeDataLayer) {
        let adobeDataLayer = require('*/cartridge/scripts/datalayer.js');
        let viewData = res.getViewData();
        var currentCategory = viewData.apiProductSearch ? viewData.apiProductSearch.category : viewData.category;
        viewData.adobeDataLayer = {};
        viewData.adobeDataLayer.PageGroup = adobeDataLayer.pageTypes.SEARCH;
        viewData.adobeDataLayer.PageName = req.pageMetaData.title;
        viewData.adobeDataLayer.Context = adobeDataLayer.CONTEXT.GLOBAL;
        var sections = {};
        sections.section2 = '';
        sections.section3 = '';
        sections.section4 = '';

        if (viewData.productSearch.isCategorySearch) {
            if (currentCategory) {
                viewData.adobeDataLayer.PageName = currentCategory.ID;
                if (currentCategory.template === 'rendering/category/catLanding') {
                    viewData.adobeDataLayer.PageGroup = adobeDataLayer.pageTypes.CLP;
                }
                var parentCategory = currentCategory.parent && currentCategory.parent.ID !== 'root' ? currentCategory.parent : null;
                if (parentCategory) {
                    sections.section2 = parentCategory.ID;
                    sections.section3 = '';
                    sections.section4 = '';
                    var subParent = parentCategory.parent;
                    if (subParent && subParent.ID !== 'root') {
                        sections.section2 = subParent.parent && subParent.parent.ID !== 'root' ? subParent.parent.ID : subParent.ID;
                        if (subParent.parent && subParent.parent.ID !== 'root') {
                            sections.section3 = subParent.ID;
                            sections.section4 = currentCategory !== parentCategory.ID ? parentCategory.ID : '';
                        } else {
                            sections.section3 = currentCategory !== parentCategory.ID ? parentCategory.ID : '';
                            sections.section4 = '';
                        }
                    }
                }
            }
        } else {
            viewData.adobeDataLayer.PageName = viewData.CurrentPageMetaData && viewData.CurrentPageMetaData.title ? viewData.CurrentPageMetaData.title : adobeDataLayer.pageTypes.SEARCH;
        }
        viewData.adobeDataLayer.sections = sections;
        res.setViewData(viewData);
    }
    next();
});

module.exports = server.exports();
