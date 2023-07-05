'use strict';

/**
 * datalayer push event
 * @param {Object} defer - the deferred object which will resolve on success or reject.
 * @param {Object} datalayer - datalayer
 *  valid model data.
 */
function pushDataLayer(defer, datalayer) {
    let dataArray = new Array();
    let datalayerContext = datalayer.Context;
    let datalayerPageGroup = datalayer.PageGroup;
    let datalayerPageName = datalayer.PageName;
    let datalayerSections = datalayer.sections;
    if (datalayerContext && datalayerPageGroup && datalayerPageName) {
        $.ajax({
            url: buildContentViewURL,
            type: 'POST',
            dataType: 'json',
            data: {
                components: JSON.stringify(dataArray),
                context: datalayerContext,
                pageGroup: datalayerPageGroup,
                pageName: datalayerPageName,
                isErrorPage: isErrorPage,
                sections: JSON.stringify(datalayerSections)
            },
            success: function (response) {
                let parsedContentView = response;
                console.log('parsedContentView:', parsedContentView);
                if (parsedContentView instanceof Array) {
                    parsedContentView.forEach(function (element) {
                        adobeDataLayer.push(element);
                    });
                } else {
                    adobeDataLayer.push(parsedContentView);
                }
                defer.resolve();
            },
            error: function () {
                console.log('error occured');
                defer.reject();
            }
        });
    }
}

/**
 * Form Completed event
 */
function formSubmitted() {
    var $form = $('.adobe-form-event');
    if ($form.length > 0) {
        adobeDataLayer.push({
            event: 'form complete',
            form: {
                name: $form.attr('data-name')
            }
        });
    }
}

module.exports = {
    methods: {
        pushDataLayer: pushDataLayer,
        formSubmitted: formSubmitted
    }
};
