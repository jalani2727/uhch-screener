'use strict';

module.exports = function (object, apiProduct) {
    Object.defineProperty(object, 'featureCompare', {
        enumerable: true,
        value: 'featureCompareText' in apiProduct.custom && apiProduct.custom.featureCompareText ? apiProduct.custom.featureCompareText.markup : ''
    });
    Object.defineProperty(object, 'isPrescriptionProduct', {
        enumerable: true,
        value: 'isPrescriptionProduct' in apiProduct.custom && apiProduct.custom.isPrescriptionProduct ? apiProduct.custom.isPrescriptionProduct : false
    });
    Object.defineProperty(object, 'isOTCProduct', {
        enumerable: true,
        value: 'isOTCProduct' in apiProduct.custom && apiProduct.custom.isOTCProduct ? apiProduct.custom.isOTCProduct : false
    });
    Object.defineProperty(object, 'isAccessories', {
        enumerable: true,
        value: 'isAccessories' in apiProduct.custom && apiProduct.custom.isAccessories ? apiProduct.custom.isAccessories : false
    });
    Object.defineProperty(object, 'isSupplies', {
        enumerable: true,
        value: 'isSupplies' in apiProduct.custom && apiProduct.custom.isSupplies ? apiProduct.custom.isSupplies : false
    });
    Object.defineProperty(object, 'followUpCare', {
        enumerable: true,
        value: apiProduct.custom.followUpCare ? apiProduct.custom.followUpCare.markup : null
    });
    Object.defineProperty(object, 'productManualLink_en', {
        enumerable: true,
        value: 'productManualLink_en' in apiProduct.custom && apiProduct.custom.productManualLink_en ? apiProduct.custom.productManualLink_en : ''
    });
    Object.defineProperty(object, 'productManualLink_es', {
        enumerable: true,
        value: 'productManualLink_es' in apiProduct.custom && apiProduct.custom.productManualLink_es ? apiProduct.custom.productManualLink_es : ''
    });
};
