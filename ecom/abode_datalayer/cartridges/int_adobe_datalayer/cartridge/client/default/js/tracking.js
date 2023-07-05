'use strict';

/**
 * Adobe datalayer event
 */
try {
    if (isAdobeDatalayer) {
        document.addEventListener('DOMContentLoaded', function () {
            let dataArray = new Array();
            let clickableNodes = document.querySelectorAll('.custom-datalayer');
            clickableNodes.forEach(function (element) {
                var jqueryElement = $(element);
                var existingDatalayer = jqueryElement.attr('data-datalayer-config');

                if (typeof existingDatalayer !== 'undefined') {
                    return;
                }
                var component = {
                    name: '',
                    location: '',
                    type: '',
                    destinationUrl: ''
                };
                var elementLink = jqueryElement.attr('href');
                if (typeof elementLink !== 'undefined') {
                    var innerText = jqueryElement.innerText;
                    var linkTitle = jqueryElement.title;
                    var linkText = jqueryElement.text();
                    var outerText = jqueryElement.outerText;
                    var label = linkText || linkTitle || innerText || outerText;
                    var linkId = jqueryElement.attr('id') || jqueryElement.attr('class');

                    if (label && linkId) {
                        // set datalayer
                        component.name = jqueryElement.attr('data-name');
                        component.location = jqueryElement.attr('data-location');
                        if (jqueryElement.hasClass('common-phone') && jqueryElement.hasClass('custom-datalayer')) {
                            component.type = 'phone';
                        } else {
                            component.type = 'internal';
                        }
                        component.destinationUrl = jqueryElement.attr('href');
                        jqueryElement.attr('data-datalayer-config', JSON.stringify(component));
                    }
                } else if (element.localName === 'button') {
                    component.name = jqueryElement.attr('data-name');
                    component.location = jqueryElement.attr('data-location');
                    component.type = 'internal';
                    component.destinationUrl = jqueryElement.closest('form').attr('action');
                    jqueryElement.attr('data-datalayer-config', JSON.stringify(component));
                }
            });

            // eslint-disable-next-line no-unused-vars
            let dlPromise = new Promise((resolve, reject) => {
                // Call the endpoint to obtain view event object and push it to datalayer
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
                            resolve();
                        },
                        error: function () {
                            console.log('error occured');
                            reject();
                        }
                    });
                } else {
                    resolve();
                }
            });
            dlPromise.then(() => {
                if ($('.adobe-form-event').attr('data-form-custom')) {
                    adobeDataLayer.push({
                        event: 'form complete',
                        form: {
                            name: $('.adobe-form-event').attr('data-form-custom')
                        }
                    });
                }
            });
        });

        // eslint-disable-next-line no-unused-vars
        $('.custom-datalayer').on('click', function () {
            var $dataAttr = $(this).closest('.custom-datalayer');
            let link = JSON.parse($dataAttr.attr('data-datalayer-config'));
            if (link) {
                adobeDataLayer.push({
                    event: 'link track',
                    link: link,
                    component: {
                        name: ''
                    }
                });
            }
        });

        // On form start adobe datalayer event
        $('.adobe-form-event input').blur(function () {
            var $form = $(this).closest('form');

            if (!$form.hasClass('event-captured')) {
                $form.addClass('event-captured');
                adobeDataLayer.push({
                    event: 'form started',
                    form: {
                        name: $form.attr('data-name')
                    }
                });
            }
        });
    }
} catch (e) {
    // temporary work around to force a server side log entry if an exception happens
    const head = document.getElementsByTagName('head').item(0);
    const script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', `\${URLUtils.https("Error-Force").abs()}?exception=${e.toString()}`);
    head.appendChild(script);
}
