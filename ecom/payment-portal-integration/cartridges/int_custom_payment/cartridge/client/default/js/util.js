/* eslint-disable linebreak-style */
'use strict';

/**
 * Returns the Parsed Serialized array of Form object.
 * @param {Array} serializedData - Serialized array of Form Object
 * @return {Object} button - button that was clicked for contact us sign-up
 */
function parseData(serializedData) {
    let formData = {};
    serializedData.forEach(function (key) {
        formData[key.name] = key.value;
    });
    return formData;
}

/**
 * Prints the page.
 */
function printPage() {
    window.print();
}

var exportedObjects = { parseData, printPage };
module.exports = exportedObjects;
