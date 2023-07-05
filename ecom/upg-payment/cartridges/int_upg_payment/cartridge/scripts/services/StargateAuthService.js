'use strict';

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Logger = require('dw/system/Logger');
var CacheMgr = require('dw/system/CacheMgr');
var StringUtils = require('dw/util/StringUtils');

var CACHE_STARGATE_TOKEN = 'JWT_Stargate';
var EXPIRE_LIMIT = 600;
/**
 * Retrieves cached token from custom cache storage
 * If no existing token object, an empty one is created
 * @returns {Object} Returns token object from custom cache
 */
function getObject() {
    var cache = CacheMgr.getCache(CACHE_STARGATE_TOKEN);
    return cache.get('token');
}

/**
 * Puts token into org Prefs
 * @param {Object} obj A plain JS object with the token
 * @returns {Object} Returns the same plain JS object
 */
function updateCachedTokenObject(obj) {
    var cache = CacheMgr.getCache(CACHE_STARGATE_TOKEN);
    cache.put('token', obj);
    return obj;
}

/**
 * Returns whether the stored token is valid
 * @param {boolean} newTokenCall - newTokenCall
 * @returns {boolean} Whether the stored token is valid and not expired
 * @alias module:models/authToken~AuthToken#isValidAuth
 */
function isValidAuth(newTokenCall) {
    if (newTokenCall) {
        return false;
    }
    if (!this.token || !this.token.access_token) {
        var cachedToken = getObject();
        if (!cachedToken) {
            return false;
        }

        if (!cachedToken.expires || Date.now() >= (cachedToken.expires)) {
            return false;
        }
        this.token = cachedToken;
    } else if (Date.now() >= this.token.expires) {
        return false;
    }

    return this.token && this.token.access_token;
}

/**
 * Gets a valid token from storage or from a new auth request
 * @param {boolean} newTokenCall - newTokenCall
 * @returns {boolean|Object} False or plain JS object containing the token response
 * @alias module:models/authToken~AuthToken#getValidToken
 */
function getValidToken(newTokenCall) {
    if (!this.isValidAuth(newTokenCall)) {
        var result;
        try {
            var starAuthService = LocalServiceRegistry.createService('upg.http.stargate.auth', {
                createRequest: function (svc) {
                    svc.setRequestMethod('POST');
                    var svcCredential = svc.getConfiguration().getCredential();
                    svc.addParam('grant_type', 'client_credentials');
                    svc.addParam('client_id', svcCredential.getUser());
                    svc.addParam('client_secret', svcCredential.getPassword());
                },
                parseResponse: function (svc, client) {
                    return client;
                },
                filterLogMessage: function (msg) {
                    return msg.replace('headers', 'Stargate TOKEN API Call');
                }
            });
            result = starAuthService.call();

            if (result.status === 'OK' && result.object) {
                var token = JSON.parse(result.object.text);
                token.expires = Date.now() + (EXPIRE_LIMIT * 1000);
                this.token = updateCachedTokenObject(token);
            } else {
                throw new Error('Unable to obtain a valid token, please verify the service credentials');
            }
        } catch (e) {
            var error = e;
            if (result) {
                error = StringUtils.format('{0} - {1} - Reason: {2} - Error message {3}',
                    'authToken.js - getValidToken',
                    result.status,
                    result.unavailableReason,
                    result.errorMessage);
            }
            Logger.getLogger('UPGError', 'upgservice').error(error);
        }
    }
    return this.isValidAuth(newTokenCall) && this.token;
}

/**
 * Token class for checking auth and retrieving valid token
 * @constructor
 * @alias module:models/authToken~AuthToken
 */
function AuthToken() {
    this.token = null;
}

/**
 * @alias module:models/authToken~AuthToken#prototype
 */
AuthToken.prototype = {
    isValidAuth: function isValid(newTokenCall) {
        return isValidAuth.apply(this, [newTokenCall]);
    },

    getValidToken: function getValid(newTokenCall) {
        return getValidToken.apply(this, [newTokenCall]);
    }
};

module.exports = AuthToken;
