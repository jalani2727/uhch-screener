'use strict';

var focusHelper = require('base/components/focus');

module.exports = function () {
    var returnData;
    var popupData = $('.confirmReturnPopup');

    var urlContent = popupData.data('url');
    var form = $('#itemsReturnSelectForm');

    /**
     * collecting and preparing data for sending to the backend
     * @param {Array} data - form data serialize
     * @returns {Object} - data in a convenient format, all item options are combined into separate item objects
     */
    function rebuildData(data) {
        var rebuild = {
            lineItems: []
        };
        var rcounts = {};
        var reasons = {};
        var qMaxs = {};
        var lineItems = [];

        data.forEach(function myFunction(item) {
            var lineItemId = item.name.match(/^lineItemId-(.+)$/);
            var rcount = item.name.match(/^rcount-(.+)$/);
            var reason = item.name.match(/^reason-(.+)$/);
            var qMax = item.name.match(/^quantityMax-(.+)$/);

            if (lineItemId) {
                lineItems.push({
                    id: lineItemId[1],
                    sfccProductId: item.value,
                    price: $('#lineItem-' + lineItemId[1]).data('price')
                });
                rcounts[lineItemId[1]] = 1;
            } else if (rcount) {
                rcounts[rcount[1]] = item.value;
            } else if (reason && item.value !== 'false') {
                reasons[reason[1]] = item.value;
            } else if (qMax) {
                qMaxs[qMax[1]] = item.value;
            } else {
                rebuild[item.name] = item.value;
            }
        });

        lineItems.forEach(function myFunction(item) {
            if (rcounts[item.id] !== undefined && reasons[item.id] !== undefined) {
                rebuild.lineItems.push(Object.assign(item, {
                    quantity: rcounts[item.id],
                    reason: reasons[item.id],
                    qMax: qMaxs[item.id] || 1 }));
            }
        });
        return rebuild;
    }

    /**
     * Renders a modal window that will confirmation return item
     */
    function showConfirmReturnModal() {
        var data = form.serializeArray();
        returnData = rebuildData(data);

        if (returnData.lineItems.length > 0) {
            $.spinner().start();
            $.ajax({
                url: urlContent,
                type: 'POST',
                data: { returnData: JSON.stringify(returnData) },
                dataType: 'html',
                success: function (response) {
                    $('.modal-body').html(response);
                    $('#confirm-return').modal('show');
                    $.spinner().stop();
                },
                error: function () {
                    $('#confirm-return').remove();
                    $.spinner().stop();
                }
            });
        }
    }

    /**
     * toggle all checkbox
     * @param {Object} e - event
     */
    function toggleAllCheckbox(e) {
        e.preventDefault();
        var checkbox = $(form).find(':checkbox:not(:disabled)');
        if (checkbox.length) {
            if (this.checked) {
                checkbox.each(function () {
                    var parent = $(this).parents('.order-history-card-details');
                    parent.find('.return-count-form').removeClass('d-none');
                    parent.find('.return-reason-form').removeClass('d-none');
                });
                checkbox.prop('checked', true);
            } else {
                checkbox.prop('checked', false);
                $(form).find('.return-count-form').addClass('d-none');
                $(form).find('.return-reason-form').addClass('d-none');
            }
        }
    }

    $('#confirm-return .button-wrapper button').click(function (e) {
        e.preventDefault();
        var url = $(this).data('url');
        if (url) {
            $.spinner().start();
            $.ajax({
                url: url,
                type: 'POST',
                data: { returnData: JSON.stringify(returnData) },
                dataType: 'json',
                success: function (res) {
                    if (res.success) {
                        $('#return-confirmation').remove();
                        $.spinner().stop();
                        var $form = $('<form action="' + res.url + '" method="post">' +
                            '<input type="hidden" name="changeBalances" id="changeBalances"/>' +
                            '<input type="hidden" name="returnData" id="returnData"/>' +
                        '</form>');
                        $form.find('#changeBalances').val(JSON.stringify(res.changeBalances));
                        $form.find('#returnData').val(JSON.stringify(returnData));
                        $('body').append($form);
                        $form.submit();
                    } else { // TODO: add error popup
                        $('#return-confirmation').remove();
                        $.spinner().stop();
                    }
                },
                error: function () { // TODO: add error popup
                    $('#return-confirmation').remove();
                    $.spinner().stop();
                }
            });
        }
    });

    $('.item-return-checkboxt-input').change(function () {
        if (this.checked) {
            $('#selectCount-form-' + this.id).removeClass('d-none');
            $('#selectReason-form-' + this.id).removeClass('d-none');
        } else {
            $('#selectCount-form-' + this.id).addClass('d-none');
            $('#selectReason-form-' + this.id).addClass('d-none');
        }
    });

    $('.confirmReturnPopup').click(function () {
        showConfirmReturnModal();
    });

    $('#selectAll').on('change', toggleAllCheckbox);

    $('.order-return-ineligible-link').click(function (e) {
        e.preventDefault();
        $('#ineligibleModal').modal('show');
    });

    $('body').on('shown.bs.modal', '#confirm-return', function () {
        $('#confirm-return').siblings().attr('aria-hidden', 'true');
        $('#confirm-return .close').focus();
    });


    $('body').on('hidden.bs.modal', '#return-confirmation', function () {
        $('#return-confirmation').siblings().attr('aria-hidden', 'false');
        $('#return-confirmation').remove();
    });

    $('body').on('keydown', '#confirm-return', function (e) {
        var focusParams = {
            event: e,
            containerSelector: '#confirm-return',
            firstElementSelector: '.affirm',
            lastElementSelector: '.decline',
            nextToLastElementSelector: '.affirm'
        };
        focusHelper.setTabNextFocus(focusParams);
    });
};
