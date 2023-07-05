'use strict';

var Cleave = require('cleave.js').default;

module.exports = {
    formatPhoneNumber: function () {
        var isPhoneInputExists = $('.input-phone').length;
        if (!isPhoneInputExists) return;

        var cleavePhone = new Cleave('.input-phone', {
            blocks: [3, 3, 4],
            delimiter: '-'
        });

        $('.input-phone').data('cleave', cleavePhone);
    }
};
