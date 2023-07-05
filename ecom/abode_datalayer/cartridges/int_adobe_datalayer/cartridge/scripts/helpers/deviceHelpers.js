'use strict';

/**
 * returns the user agent
 * @returns {string} return HTTP user agent
 */
function getHttpUserAgent() {
    return (typeof request !== 'undefined' ? request.getHttpUserAgent().toLowerCase() : '');
}

/**
 * Checks if device is mobile or tablet
 * This feature should not be used elsewhere without informing Tech Archs
 * @returns {boolean} return true or false based on device
 */
function isMobileOrTabletDevice() {
    var userAgent = getHttpUserAgent();
    var isMobileOrTablet = false;
    if (userAgent !== null) {
        if ((userAgent.includes('windows phone'))
        || (userAgent.includes('ipad'))
        || (userAgent.includes('iphone'))
        || (userAgent.includes('android'))
        || (userAgent.includes('blackberry'))
        || (userAgent.includes('samsung'))) {
            isMobileOrTablet = true;
        }
    }
    return isMobileOrTablet;
}

module.exports = {
    isMobileOrTabletDevice: isMobileOrTabletDevice,
    getHttpUserAgent: getHttpUserAgent
};
