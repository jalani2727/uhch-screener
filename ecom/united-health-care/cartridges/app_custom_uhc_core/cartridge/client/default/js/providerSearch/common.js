'use strict';

var $mapEl = require('./utils/domUtil').$mapEl;
var markerDifferentiatorKey = 'PreferredTier';

/**
 * Returns true for preferred practice
 * @param {Object} practice Practice object
 * @returns {boolean} returns true if the practice is preferred one
 */
function isPreferredProvider(practice) {
    var value = practice[markerDifferentiatorKey];
    if (!value) return false;

    return value === '2nd' || value === 'FP';
}

/**
 * Returns URL for preferred practice marker
 * @returns {string} image url
 */
function getPreferredProviderMarkerIconUrl() {
    return $mapEl.data('preferredProviderMarker');
}

/**
 * Returns URL for standard practice marker
 * @returns {string} image url
 */
function getStandardProviderMarkerIconUrl() {
    return $mapEl.data('standardProviderMarker');
}

/**
 * Returns image path for the
 * @param {Array} practice Practice object
 * @returns {string} Image path
 */
function getMarkerImageUrl(practice) {
    return isPreferredProvider(practice) ? getPreferredProviderMarkerIconUrl() : getStandardProviderMarkerIconUrl();
}

/**
 * Split long address into multiple Address Lines.
 * @param {string} addr - contains address
 * @param {number} addressLinesRequired - number of lines in which address needs to be split
 * @return {Object} address - object that contains multiple addressLines
 */
function splitAddress(addr, addressLinesRequired) {
    var address = {};
    var completeAddress = addr.split(',');
    var objKey1 = 'addressLine';
    var objKey2 = 'isAddressLine';
    for (let i = 1; i <= addressLinesRequired; i++) {
        address[objKey1 + i] = '';
        address[objKey2 + i] = false;
    }
    if (addr && addressLinesRequired === 1) {
        address[objKey1 + addressLinesRequired] = addr.trim();
        address[objKey2 + addressLinesRequired] = (addr.trim()).length > 0;
    } else if (addr && completeAddress.length < addressLinesRequired) {
        address[objKey1 + completeAddress.length] = addr.trim();
        address[objKey2 + completeAddress.length] = (addr.trim()).length > 0;
    } else if (addr) {
        let sliceEndIndex = completeAddress.length > addressLinesRequired ? completeAddress.length - 1 : addressLinesRequired - 1;
        let addressLines = completeAddress.slice(0, sliceEndIndex - 1);
        let lastAddressLine = (completeAddress.slice(sliceEndIndex - 1, completeAddress.length).join(',')).trim();
        let loopCount = addressLinesRequired > addressLines.length ? addressLines.length + 1 : addressLinesRequired;
        for (let i = 1; i < loopCount; i++) {
            if (i === loopCount - 1) {
                address[objKey1 + i] = lastAddressLine.length > 0 ? ((addressLines.slice(i - 1, addressLines.length).join(',')).trim()).concat(',') : (addressLines.slice(i - 1, addressLines.length).join(',')).trim();
            } else {
                address[objKey1 + i] = addressLines[i - 1].trim().concat(',');
            }
            address[objKey2 + i] = address[objKey1 + i].length > 0;
        }
        address[objKey1 + loopCount] = lastAddressLine;
        address[objKey2 + loopCount] = lastAddressLine.length > 0;
    }
    return address;
}

/**
 * Add required brands in Practice services
 * @param {Array} brands brands to be added as part of service at a Practice level
 * @param {Array} selectedPracticeBrands all brands at a selected Practice level
 * @returns {Array} practiceServices
 */
function addPracticeBrands(brands, selectedPracticeBrands) {
    var practiceServices = [];
    if (selectedPracticeBrands && selectedPracticeBrands.length > 0) {
        for (let brand of brands) {
            for (let practiceBrand of selectedPracticeBrands) {
                if (practiceBrand.toLowerCase().replace(/ /g, '') === brand.toLowerCase().replace(/ /g, '')) {
                    practiceServices.push(brand);
                    break;
                }
            }
        }
    }
    return practiceServices;
}

module.exports = {
    isPreferredProvider: isPreferredProvider,
    getMarkerImageUrl: getMarkerImageUrl,
    getPreferredProviderMarkerIconUrl: getPreferredProviderMarkerIconUrl,
    getStandardProviderMarkerIconUrl: getStandardProviderMarkerIconUrl,
    splitAddress: splitAddress,
    addPracticeBrands: addPracticeBrands
};
