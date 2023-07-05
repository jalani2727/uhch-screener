'use strict';

/**
 * Forming an address object from the UPS Candidate Address
 * @param {Object} candidateAddress - the UPS Candidate Address
 * @param {Object} addressObj - User entered Address
 * @return {Object} Formed address Object
 */
function getAddressObject(candidateAddress, addressObj) {
    var address = {};
    var postalCode = candidateAddress.PostcodePrimaryLow;
    if (candidateAddress.PostcodeExtendedLow) {
        postalCode += '-' + candidateAddress.PostcodeExtendedLow;
    }
    var arr = [];
    var suggestedAddress = candidateAddress.AddressLine;
    if (suggestedAddress instanceof Array){
        address.address1 = suggestedAddress[0];
        arr = suggestedAddress.filter(function(item) {
            return item !== suggestedAddress[0]
        })
        address.address2 = arr.join(", ");
    }
    else{
        address.address1 = candidateAddress.AddressLine;
    }
    address.city = candidateAddress.PoliticalDivision2;
    address.state = candidateAddress.PoliticalDivision1;
    address.countryCode = candidateAddress.CountryCode;
    address.postalCode = postalCode;
    return address;
}

/**
 *
 * @param {Object} response - UPS service response
 * @return {boolean} returns true if it is valid address accoring to UPS response
 */
function getAddressIndicator(response) {
    var validAddress = false;
    if ('ValidAddressIndicator' in response) {
        validAddress = true;
    } else if ('NoCandidatesIndicator' in response) {
        validAddress = false;
    } else if ('AmbiguousAddressIndicator' in response) {
        validAddress = false;
    }
    return validAddress;
}

module.exports = {
    getAddressIndicator: getAddressIndicator,
    getAddressObject: getAddressObject
};
