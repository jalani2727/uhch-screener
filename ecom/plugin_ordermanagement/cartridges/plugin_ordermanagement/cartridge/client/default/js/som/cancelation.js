'use strict';

var focusHelper = require('base/components/focus');

module.exports = function () {
    var cancelData;
    var popupData = $('.confirmCancelationPopup');

    var urlContent = popupData.data('url');
    var form = $('#itemsCancelationSelectForm');

    /**
     * collecting and preparing data for sending to the backend
     * @param {Array} data - form data serialize
     * @returns {Object} - data in a convenient format, all item options are combined into separate item objects
     */
    function rebuildData(data) {
        var rebuild = {
            lineItems: []
        };
        var ccounts = [];
        var lineItems = [];
        var reason = $('#reason').val();
        data.forEach(function myFunction(item) {
            var lineItemId = item.name.match(/^lineItemId-(.+)$/);
            var ccount = item.name.match(/^ccount-(.+)$/);
            if (lineItemId || ccount) {
                if (lineItemId) {
                    lineItems.push({
                        id: lineItemId[1],
                        sfccProductId: item.value,
                        reason: reason,
                        price: $('#lineItem-' + lineItemId[1]).data('price')
                    });
                    ccounts[lineItemId[1]] = 1;
                }
                if (ccount) {
                    ccounts[ccount[1]] = item.value;
                }
            } else {
                rebuild[item.name] = item.value;
            }
        });

        lineItems.forEach(function myFunction(item) {
            if (ccounts[item.id] !== undefined) {
                rebuild.lineItems.push(Object.assign(item, { quantity: ccounts[item.id] }));
            }
        });
        return rebuild;
    }

    /**
     * Renders a modal window that will confirmation cancelation item
     */
    function showConfirmCancelationModal() {
        var data = form.serializeArray();
        var select = $(form).find('#reason').val();
        if (select !== 'false') {
            cancelData = rebuildData(data);

            if (cancelData.lineItems.length > 0) {
                $.spinner().start();
                $.ajax({
                    url: urlContent,
                    type: 'POST',
                    data: { cancelData: JSON.stringify(cancelData) },
                    dataType: 'html',
                    success: function (response) {
                        $('.modal-body').html(response);
                        $('#confirm-cancelation').modal('show');
                        $.spinner().stop();
                    },
                    error: function () {
                        $('#confirm-cancelation').remove();
                        $.spinner().stop();
                    }
                });
            }
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
                    parent.find('.cancelation-count-form').removeClass('d-none');
                });
                checkbox.prop('checked', true);
            } else {
                checkbox.prop('checked', false);
                $(form).find('.cancelation-count-form').addClass('d-none');
            }
        }
    }
    $('#confirm-cancelation .button-wrapper button').click(function (e) {
        e.preventDefault();
        var url = $(this).data('url');
        if (url) {
            $.spinner().start();
            $.ajax({
                url: url,
                type: 'POST',
                data: { cancelData: JSON.stringify(cancelData) },
                dataType: 'json',
                success: function (res) {
                    if (res.success) {
                        $('#return-confirmation').remove();
                        $.spinner().stop();
                        var $form = $('<form action="' + res.url + '" method="post">' +
                            '<input type="hidden" name="changeBalances" id="changeBalances"/>' +
                            '<input type="hidden" name="cancelData" id="cancelData"/>' +
                        '</form>');
                        $form.find('#changeBalances').val(JSON.stringify(res.changeBalances));
                        $form.find('#cancelData').val(JSON.stringify(cancelData));
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

    $('.item-cancel-checkboxt-input').change(function () {
        if (this.checked) {
            $('#selectCount-form-' + this.id).removeClass('d-none');
        } else {
            $('#selectCount-form-' + this.id).addClass('d-none');
        }
    });

    $('.confirmCancelationPopup').click(function () {
        showConfirmCancelationModal();
    });

    $('#selectAll').on('change', toggleAllCheckbox);

    $('body').on('shown.bs.modal', '#confirm-cancelation', function () {
        $('#confirm-cancelation').siblings().attr('aria-hidden', 'true');
        $('#confirm-cancelation .close').focus();
    });


    $('body').on('hidden.bs.modal', '#cancel-confirmation', function () {
        $('#cancel-confirmation').siblings().attr('aria-hidden', 'false');
        $('#cancel-confirmation').remove();
    });

    $('body').on('keydown', '#confirm-cancelation', function (e) {
        var focusParams = {
            event: e,
            containerSelector: '#confirm-cancelation',
            firstElementSelector: '.affirm',
            lastElementSelector: '.decline',
            nextToLastElementSelector: '.affirm'
        };
        focusHelper.setTabNextFocus(focusParams);
    });
};
