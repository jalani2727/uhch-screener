'use strict';

var base = module.superModule;

/**
 * helper for setting Customer detail In Session
 * @param {req} req - Object
 */
function setCustomerType(req) {
    if (session.privacy.subscriberId && session.privacy.subscriberId !== null && session.privacy.opportunityId && session.privacy.opportunityId !== null && session.privacy.pricebook && session.privacy.pricebook !== null) {
        // setting UHCVerified customer type as it has UHC subcriber id and opportunityId
        req.session.privacyCache.set('customerType', 'UHCVerified');
    } else if (session.privacy.AARPSubscriberId !== null && session.privacy.AARP_Member && session.privacy.AARP_Member === 'true') {
        req.session.privacyCache.set('customerType', 'AARPVerified');
    } else if (session.privacy.AARPSubscriberId !== null && session.privacy.AARP_Member && session.privacy.AARP_Member === 'false') {
        req.session.privacyCache.set('customerType', 'AARPNotVerified');
    } else {
        req.session.privacyCache.set('customerType', 'AARPNoData');
    }
}

base.setCustomerType = setCustomerType;
module.exports = base;
