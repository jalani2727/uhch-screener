'use strict';

var filesData;
var uploadedfile = '';

/**
 * Display the returned message.
 * @param {string} data - data returned from the server's ajax call
 * @param {Object} button - button that was clicked for contact us sign-up
 */
function displayMessage(data) {
    $.spinner().stop();
    if (data.formatError) {
        $('.check-mark-success').css('visibility', 'hidden');
        $('.upload-file-error').html('<div class="error-messages alert-danger"><span class="file-upload-error"> ' + data.msg + '</span></div>');
    } else {
        $('.api-error-message').html('<div class="error-messages alert alert-danger"><span class="file-upload-error"> ' + data.msg + '</span></div>');
    }
}

/**
 * Reads the uploaded File Data using filereader and updates global object on load of the file
 * @param {File} file - File object which is uploaded
 */
function fileRead(file) {
    var fileReadObj = new FileReader();
    // eslint-disable-next-line no-unused-expressions
    fileReadObj.readAsDataURL(file);
    fileReadObj.onload = function () {
        var fileResult = fileReadObj.result;
        var fileObj = {
            fileBody: fileResult,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size
        };
        // if (fileObj.fileBody !== null && fileObj.fileBody !== 'undefined') {
        //     fileObj.fileBody = fileObj.fileBody.toString().replace(/^data:(.*,)?/, '');
        // }
        filesData = fileObj;
    };
}

/**
 * Returns the Parsed Serialized array of Form object.
 * @param {Array} serializedData - Serialized array of Form Object
 * @return {Object} button - button that was clicked for contact us sign-up
 */
function parseData(serializedData) {
    var returnData = {};
    serializedData.forEach(function (key) {
        returnData[key.name] = key.value;
    });
    return returnData;
}

/**
 * Returns files data.
 * @returns {Object} - File data
 */
function getFilesData() {
    return filesData;
}

/**
 * Returns files.
 * @returns {file} - File
 */
function getFile() {
    return uploadedfile;
}

/**
 * set file.
 * @param {File} file - uploaded file
 * @returns {string} - SUCCESS/FAIL
 */
function setFile(file) {
    uploadedfile = file;
    if (uploadedfile) {
        return 'SUCCESS';
    }
    return 'FAIL';
}

/**
 * Clears labels from File upload box.
 */
function clearFileUploadLabels() {
    $('.file-name').remove();
    $('.file-upload-label').remove();
    $('.check-mark-success').css('visibility', 'hidden');
}

/**
 * Checks if the file format is valid.
 * @param {File} uploadedFileObj - File object which is uploaded
 * @return {boolean} - isValidFileFormat.
 */
function validateFileFormat(uploadedFileObj) {
    let acceptedFileFormatsStr = ((uploadedFileObj.accept).toString()).toLowerCase();
    let fileNameStr = uploadedFileObj.value;
    let fileExtensionStr = (fileNameStr.substring(fileNameStr.lastIndexOf('.'), fileNameStr.length)).toLowerCase();
    let isValidBln = acceptedFileFormatsStr.includes(fileExtensionStr);
    return isValidBln;
}

module.exports = {
    getFilesData: getFilesData,
    displayMessage: displayMessage,
    fileRead: fileRead,
    parseData: parseData,
    validateFileFormat: validateFileFormat,
    clearFileUploadLabels: clearFileUploadLabels,
    getFile: getFile,
    setFile: setFile
};
