'use strict';

var BENEFITS_TYPE = {
    BENEFITS_VERIFIED: 'benefitsVerified',
    BENEFITS_NOT_VERIFIED: 'benefitsNotVerified',
    MEMBER_DATA_ONLY: 'memberDataOnly'
};

var $fullRegistrationBenefitsVerifiedModal = $('#fullRegistrationBenefitsVerifiedModal');
var $fullRegistrationBenefitsNotVerifiedModal = $('#fullRegistrationBenefitsNotVerifiedModal');
var $partialRegistrationmemberDataOnlyModal = $('#partialRegistrationMemberDataOnlyModal');

module.exports = function () {
    // Get 'registration type' from cookie
    var registrationType = (document.cookie.match('(^|;)\\s*registrationType\\s*=\\s*([^;]+)') || []).pop();
    if (!registrationType) return;

    var $modalEl;

    switch (registrationType) {
        case BENEFITS_TYPE.BENEFITS_NOT_VERIFIED:
            $modalEl = $fullRegistrationBenefitsNotVerifiedModal;
            break;
        case BENEFITS_TYPE.BENEFITS_VERIFIED:
            $modalEl = $fullRegistrationBenefitsVerifiedModal;
            break;
        case BENEFITS_TYPE.MEMBER_DATA_ONLY:
            $modalEl = $partialRegistrationmemberDataOnlyModal;
            break;
        default:
            return;
    }

    $modalEl.modal('show');
    document.cookie = 'registrationType=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};
