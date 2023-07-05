'use strict';

/**
 * Return the average of the values which is passed
 * @param {Object} hlValues - Object of Right responses from GetLeadSvc
 * @returns {boolean} returns true or false based on the condition
 */
function getAverage(hlValues) {
    return (hlValues.hz500 + hlValues.hz1000 + hlValues.hz2000 + hlValues.hz4000) / 4;
}

/**
 * Checks the conditions which would be satisfied for Good Hearing Results
 * @param {Object} hlRight - Object of Right responses from GetLeadSvc
 * @param {Object} hlLeft - Object of Left responses from GetLeadSvc
 * @returns {boolean} returns true or false based on the condition
 */
function isSevereHearingLoss(hlRight, hlLeft) {
    return ((hlRight.hz500 > 70 || hlRight.hz1000 > 70) ||
    (hlLeft.hz500 > 70 || hlLeft.hz1000 > 70) ||
            (hlRight.hz2000 > 80 || hlRight.hz4000 > 80 || hlRight.hz6000 > 80) ||
                 (hlLeft.hz2000 > 80 || hlLeft.hz4000 > 80 || hlLeft.hz6000 > 80));
}

/**
 * Checks the conditions which would be satisfied for Good Hearing Results
 * @param {Object} hlRight - Object of Right responses from GetLeadSvc
 * @param {Object} hlLeft - Object of Left responses from GetLeadSvc
 * @returns {boolean} returns true or false based on the condition
 */
function isModerateHearingLoss(hlRight, hlLeft) {
    var averageRight = getAverage(hlRight);
    var averageLeft = getAverage(hlLeft);
    return (averageRight > 20 && averageRight <= 75) || (averageLeft > 20 && averageLeft <= 75);
}

/**
 * Checks the conditions which would be satisfied for Good Hearing Results
 * @param {Object} hlRight - Object of Right responses from GetLeadSvc
 * @param {Object} hlLeft - Object of Left responses from GetLeadSvc
 * @returns {boolean} returns true or false based on the condition
 */
function isGoodHearingLoss(hlRight, hlLeft) {
    var averageRight = getAverage(hlRight);
    var averageLeft = getAverage(hlLeft);
    return (averageRight <= 20) || (averageLeft <= 20);
}

/**
 * Calculates test result based on the result from Senova Update in SF Ease
 * @param {Object} result - JSOn object from GetLeadSvc Service call for respetcive lead
 * @returns {string} String which repersents status of hearing test
 */
function getHearingTestResults(result) {
    var hlRight = result.hlRight;
    var hlLeft = result.hlLeft;
    if (hlRight && hlLeft) {
        if (isSevereHearingLoss(hlRight, hlLeft)) {
            return 'poor';
        } else if (isModerateHearingLoss(hlRight, hlLeft)) {
            return 'moderate';
        } else if (isGoodHearingLoss(hlRight, hlLeft)) {
            return 'good';
        }
    }

    return 'moderate';
}

/**
 * Reads the file and convert the file into a string
 * @param {string} filePath - File path on which the file is present
 * @returns {string} returns a string with file data
 */
function readFile(filePath) {
    var File = require('dw/io/File');
    var FileReader = require('dw/io/FileReader');

    var testfile = new File(filePath);
    var fileReader = new FileReader(testfile, 'ISO-8859-1');

    var fileContent = fileReader.getString();
    fileReader.close();
    return fileContent;
}

/**
 * Encode the File data to base64
 * @param {string} str - file data string
 * @param {string} characterEncoding - encoding type
 * @returns {string} returns a encoded string with file data
 */
function encodeBase64ForFile(str, characterEncoding) {
    var StringUtils = require('dw/util/StringUtils');
    var strBase64 = StringUtils.encodeBase64(str, characterEncoding);
    return strBase64;
}

/**
 * Encode the File data to base64
 * @param {string} filepath - file path on which the file is placed
 * @returns {string} returns a encoded string with file data
 */
function processFile(filepath) {
    var fileContent = readFile(filepath);
    var fileBody = encodeBase64ForFile(fileContent, 'ISO-8859-1');
    return fileBody;
}

module.exports = {
    getHearingTestResults: getHearingTestResults,
    processFile: processFile
};
