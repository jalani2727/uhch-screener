'use strict';

var filesData;
var uploadedfile = '';

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
    $('.upload-file-error').empty();
    $('.file-upload-label').removeClass('d-none');
    $('.check-mark-success').css('visibility', 'hidden');
}

/**
 * Checks if the file format is valid.
 * @param {File} uploadedFileObj - File object which is uploaded
 * @return {boolean} - isValidFileFormat.
 */
function validateFileFormat(uploadedFileObj) {
    let acceptedFileFormatsStr = (((uploadedFileObj.accept).toString()).toLowerCase()).replace(/ /g, '');
    let acceptedFileFormatsArr = acceptedFileFormatsStr.split(',');
    let fileNameStr = uploadedFileObj.value;
    let fileExtensionStr = (fileNameStr.substring(fileNameStr.lastIndexOf('.'), fileNameStr.length)).toLowerCase();
    for (let fileFormatStr of acceptedFileFormatsArr) {
        if (fileFormatStr === fileExtensionStr) {
            return true;
        }
    }
    return false;
}

module.exports = {
    getFilesData: getFilesData,
    validateFileFormat: validateFileFormat,
    clearFileUploadLabels: clearFileUploadLabels,
    getFile: getFile,
    setFile: setFile
};
