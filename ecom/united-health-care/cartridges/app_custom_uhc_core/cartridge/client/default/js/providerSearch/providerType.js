/**
 * Attach event on provider type radio buttons.
 */
function initProviderTypeRadioButtons() {
    $('input[name$="_searchForm_providerType"]').on('change', function (e) {
        if (e.target.value === 'Virtual') {
            $('.virtual-visits-container').show();
        } else {
            $('.virtual-visits-container').hide();
        }
    });
}

module.exports = initProviderTypeRadioButtons;
