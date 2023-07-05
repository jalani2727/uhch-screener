'use strict';

var base = module.superModule;

/**
 * Sets the relevant product search model properties, depending on the parameters provided
 *
 * @param {dw.catalog.ProductSearchModel} productSearch - Product search object
 * @param {Object} httpParams - Query params
 * @param {dw.catalog.Category} selectedCategory - Selected category
 * @param {dw.catalog.SortingRule} sortingRule - Product grid sort rule
 * @param {Object} httpParameterMap - Query params
 * @property {Double} [httpParameterMap.pmin] - Minimum Price
 * @property {Double} [httpParameterMap.pmax] - Maximum Price
 */
base.setProductProperties = function setProductProperties(productSearch, httpParams, selectedCategory, sortingRule, httpParameterMap) {
    var preferences = require('*/cartridge/config/preferences.js');
    var searchPhrase;
    if (httpParams.q) {
        searchPhrase = httpParams.q;
        productSearch.setSearchPhrase(searchPhrase);
    }
    if (selectedCategory) {
        productSearch.setCategoryID(selectedCategory.ID);
    }
    if (httpParams.pid) {
        productSearch.setProductIDs([httpParams.pid]);
    }
    var minPrice = preferences.minPriceRefineValue;
    if (httpParameterMap) {
        // setting the min price value to refine the products without price
        var minPriceValue = httpParameterMap.pmin && httpParameterMap.pmin.doubleValue ? httpParameterMap.pmin.doubleValue : minPrice;
        productSearch.setPriceMin(minPriceValue);
        if (httpParameterMap.pmax) {
            productSearch.setPriceMax(httpParameterMap.pmax.doubleValue);
        }
    } else {
        productSearch.setPriceMin(minPrice);
    }

    if (httpParams.pmid) {
        productSearch.setPromotionID(httpParams.pmid);
    }

    if (sortingRule) {
        productSearch.setSortingRule(sortingRule);
    }
    productSearch.setRecursiveCategorySearch(true);
};


module.exports = base;
