'use strict';

var practices = (window.results || {}).practices || [];
var normalizedPractices = new Map();

var brandsDropdownValues = new Set();
var providersDropdownValues = new Set();

/**
 * Resets the client data
 */
function resetClientData() {
    normalizedPractices.clear();
    brandsDropdownValues.clear();
    providersDropdownValues.clear();
}

/**
 * Creates structured client data
 */
function setupClientData() {
    resetClientData();

    practices.forEach(function (practice) {
        // Storing hashmaps for easy retrival
        var practiceId = practice.practiceId;
        normalizedPractices.set(practiceId, practice);

        // Create brand filter values
        (practice.brand || []).forEach(function (brand) {
            brandsDropdownValues.add(brand);
        });
        (practice.providers || []).forEach(function (provider) {
            (provider.services || []).forEach(function (service) {
                providersDropdownValues.add(service);
            });
        });
    });
}

/**
 * Verify if the pracitce has a brand or not
 * @param {Object} result Practice object
 * @param {string} brand name
 * @returns {boolean} returns true if the brand is associated with the practice
 */
function hasBrand(result, brand) {
    if (result && Array.isArray(result.brand)) {
        return result.brand.indexOf(brand) !== -1;
    }
    return false;
}

/**
 * Verify if the practice has a provider or not
 * @param {Object} result Practice object
 * @param {string} providerValue name
 * @returns {boolean} returns true if the provider is associated with the practice
 */
function hasProvider(result, providerValue) {
    if (result && Array.isArray(result.providers)) {
        return result.providers.some(function (provider) {
            return provider.services.indexOf(providerValue) !== -1;
        });
    }
    return false;
}

/**
 * Updates the filteredResults based on selected brand and selected Provider
 * @param {string} selectedBrand brandName
 * @param {string} selectedProvider providerType
 * @returns {Array} filtered practices array
 */
function filterPractices(selectedBrand, selectedProvider) {
    return practices.filter(function (result) {
        if (selectedBrand && selectedProvider) {
            return (
                hasBrand(result, selectedBrand) &&
                hasProvider(result, selectedProvider)
            );
        } else if (selectedBrand && !selectedProvider) {
            return hasBrand(result, selectedBrand);
        } else if (!selectedBrand && selectedProvider) {
            return hasProvider(result, selectedProvider);
        }
        return true;
    });
}

module.exports = {
    brandsDropdownValues: brandsDropdownValues,
    providersDropdownValues: providersDropdownValues,
    practices: practices,
    normalizedPractices: normalizedPractices,
    filterPractices: filterPractices,
    setupClientData: setupClientData
};
