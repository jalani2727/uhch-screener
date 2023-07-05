'use strict';

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Logger = require('dw/system/Logger');
var CacheMgr = require('dw/system/CacheMgr');
var StringUtils = require('dw/util/StringUtils');

var CACHE_STARGATE_TOKEN = 'JWT_Middleware';
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
            var starAuthService = LocalServiceRegistry.createService('ease.http.middleware.auth', {
                createRequest: function (svc) {
                    svc.addHeader('Content-Type', 'application/json');
                    svc.addHeader('Accept', 'application/json');
                    svc.setRequestMethod('POST');
                    var svcCredential = svc.getConfiguration().getCredential();
                    var requestBody = {
                        ClientKey: svcCredential.getUser(),
                        ClientSecret: svcCredential.getPassword()
                    };
                    return JSON.stringify(requestBody);

                },
                parseResponse: function (svc, client) {
                    return client;
                },
                filterLogMessage: function (msg) {
                    return msg.replace('headers', 'Middleware TOKEN API Call');
                }
            });
            result = starAuthService.call();

            if (result.status === 'OK' && result.object) {
                var tokenVal= JSON.parse(result.object.text);
                var tokenObj = {};
                tokenObj.expires = Date.now() + (EXPIRE_LIMIT * 1000);
                tokenObj.access_token = tokenVal;
                this.token = updateCachedTokenObject(tokenObj);
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
            Logger.getLogger('Middleware', 'middlewareservice').error(error);
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
