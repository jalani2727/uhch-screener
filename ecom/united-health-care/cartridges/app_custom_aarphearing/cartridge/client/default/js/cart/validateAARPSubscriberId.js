/* eslint-disable no-undef */
'use strict';

module.exports = function () {
    $('.aarp-subscriber-id-form').submit(function (e) {
        e.preventDefault();
        var form = $('.aarp-subscriber-id-form');
        $.ajax({
            url: form.attr('action'),
            type: 'POST',
            dataType: 'json',
            data: form.serialize(),
            success: function success(data) {
                if (data.error) {
                    $('.aarp-subscriber-id-form .form-control').addClass('is-invalid');
                    $('.invalid-feedback').empty().html(data.message);
                    $('.checkout-btn').addClass('disabled');
                } else {
                    $('.checkout-btn').removeClass('disabled');
                    window.location.href = data.redirectUrl;
                }
                $.spinner().stop();
            },
            error: function error(err) {
                window.location.href = err.redirectUrl;
            }
        });
        return false;
    });

    $('.aarp-subscriber-id-field').on('keyup', function () {
        if ($(this).attr('data-iserrormessage') === 'true') {
            return;
        }
        $('button.checkout-btn').removeClass('disabled');
        $('.aarp-subscriber-id-form .form-control').removeClass('is-invalid');
        $('.invalid-feedback').empty();
    });
};
