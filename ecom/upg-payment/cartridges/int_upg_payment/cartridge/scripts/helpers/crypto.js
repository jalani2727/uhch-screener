'use strict';

var Cipher = require('dw/crypto/Cipher');
var Encoding = require('dw/crypto/Encoding');
var Bytes = require('dw/util/Bytes');
var preferences = require('*/cartridge/config/preferences');

/**
* encrypt order number
* @param {string} orderNumber - orderNumber
* @returns {string} encryptValue
*/
function encrypt(orderNumber) {
    var key = preferences.orderEncryptionKey;
    var salt = preferences.orderEncryptionSalt;
    var encodedKey = Encoding.toBase64(new Bytes(key, 'UTF8'));
    var encodedSalt = Encoding.toBase64(new Bytes(salt, 'UTF8'));
    var cipher = new Cipher();
    return cipher.encrypt(orderNumber, encodedKey, 'AES', encodedSalt, 5);
}

/**
* decrypt order number
* @param {string} encryptValue - encryptValue
* @returns {string} decryptValue
*/
function decrypt(encryptValue) {
    var key = preferences.orderEncryptionKey;
    var salt = preferences.orderEncryptionSalt;
    var encodedKey = Encoding.toBase64(new Bytes(key, 'UTF8'));
    var encodedSalt = Encoding.toBase64(new Bytes(salt, 'UTF8'));
    var cipher = new Cipher();
    return cipher.decrypt(encryptValue, encodedKey, 'AES', encodedSalt, 5);
}

module.exports = {
    encrypt: encrypt,
    decrypt: decrypt
};
