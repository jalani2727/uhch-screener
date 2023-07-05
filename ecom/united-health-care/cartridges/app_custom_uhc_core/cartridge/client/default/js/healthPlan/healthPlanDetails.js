'use strict';

var clientSideValidation = require('core/components/clientSideValidation');
var processInclude = require('base/util');

/**
 * Renders a modal window that will show health Plan Model
 */
function showHealthPlanModal() {
    var healthPlanData = $('.health-plan-main');

    var textHeader = healthPlanData.data('heading');
    var textBody = healthPlanData.data('body');
    var textYes = healthPlanData.data('accepttext');
    var textNo = healthPlanData.data('rejecttext');
    var footerText = healthPlanData.data('footertext');
    var urlAccept = healthPlanData.data('accept');
    var urlReject = healthPlanData.data('reject');

    var htmlString = '<!-- Modal -->'
        + '<div class="modal" id="health-plan-model" tabindex="-1" aria-modal="true" role="dialog">'
        + '<div class="modal-dialog">'
        + '<!-- Modal content-->'
        + '<div class="modal-content health-plan-model-content">'
        + '<div class="modal-header border-0 d-block">'
        + '<div class="uhc-blue uhc-serif uhc-main-title text-center pb-2">'
        + textHeader
        + '</div>'
        + '<button type="button" class="close" data-url="' + urlReject + '" data-dismiss="modal" aria-label="Close">'
        + '<span aria-hidden="true"> </span> <span class="sr-only"> </span>'
        + '</button>'
        + '</div>'
        + '<div class="modal-body text-center">'
        + textBody
        + '</div>'
        + '<div class="pt-3 text-center">'
        + '<div class="button-wrapper">'
        + '<div class="pb-4"><button class="affirm btn btn-primary" data-url="' + urlAccept + '" autofocus>'
        + textYes
        + '</button></div>'
        + '<div class="pb-4 text-center"><button class="decline btn btn-outline-primary" data-url="' + urlReject + '" data-dismiss="modal" >'
        + textNo
        + '</button> </div>'
        + '</div>'
        + '<div class="footer-text pt-1 pb-5 text-center">'
        + footerText
        + '</div>'
        + '</div>'
        + '</div>'
        + '</div>'
        + '</div>';
    $('body').append(htmlString);
    $('#health-plan-model').modal('show');

    $('#health-plan-model .affirm').click(function (e) {
        e.preventDefault();
        var url = $(this).data('url');
        $.ajax({
            url: url,
            type: 'get',
            success: function (response) {
                // Only hide modal if the operation is successful - don't want to give a false impression
                if (response.success === 'close') {
                    $('#health-plan-model').remove();
                    $.spinner().stop();
                } else {
                    $('.health-plan-model-content').html(response);
                    processInclude(clientSideValidation);
                    $('form.health-plan-form').submit(function (el) {
                        el.preventDefault();
                        var $form = $(this).closest('form');
                        $('.health-plan-model-content').spinner().start();
                        var formURL = $form.attr('action');
                        $.ajax({
                            url: formURL,
                            type: 'post',
                            data: $form.serialize(),
                            success: function (data) {
                                $('.health-plan-model-content').html(data);
                                $('.health-plan-model-content').spinner().stop();
                            }
                        });
                    });
                }
            }
        });
    });

    $('#health-plan-model').on('hidden.bs.modal', function (e) {
        e.preventDefault();
        var url = urlReject;
        $.ajax({
            url: url,
            type: 'get',
            success: function () {
                $('#health-plan-model').remove();
                $.spinner().stop();
            },
            error: function () {
                $.spinner().stop();
            }
        });
    });
}

module.exports = {
    showHealthPlanDetails: function () {
        if ($('.health-plan-main').length > 0 && ($('.health-plan-main').attr('data-showmodel') === 'true')) {
            showHealthPlanModal();
        }
    }
};
