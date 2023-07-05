'use strict';

/**
 * Zoom activation event handler
 * @param {e} e object
 */
function handleZoomInClick(e) {
    var $zoomActivateIcon = $(e.target);
    var $zoomDeactivateIcon = $zoomActivateIcon.parent().find('.zoom-deactivate');

    $zoomActivateIcon.hide();
    $zoomDeactivateIcon.show();

    var $zoomContainer = $zoomActivateIcon.parent();

    $zoomContainer.zoom({
        magnify: 2,
        callback: function () {
            $zoomContainer.trigger('mouseout');

            /* eslint-disable new-cap */
            var mouseOverEvent = $.Event('mouseover');

            var offset = $zoomContainer.offset();
            var bounds = $zoomContainer.get(0).getBoundingClientRect();
            mouseOverEvent.pageX = offset.left + (bounds.width / 2);
            mouseOverEvent.pageY = offset.top + (bounds.height / 2);

            setTimeout(function () {
                $zoomContainer.trigger(mouseOverEvent);
            }, 100);
        }
    });
}

/**
 * Zoom de-activation event handler
 * @param {e} e object
 */
function handleZoomOutClick(e) {
    var $zoomDeactivateIcon = $(e.target);
    var $zoomActivateIcon = $zoomDeactivateIcon.parent().find('.zoom-activate');

    $zoomActivateIcon.show();
    $zoomDeactivateIcon.hide();

    var $zoomContainer = $zoomDeactivateIcon.parent();

    $zoomContainer.trigger('zoom.destroy');
}

/**
 * Zoom events initialization
 */
function initZoomEvents() {
    var $imageZoomContainers = $('.carousel-item').addClass('zoomable-image-container');
    var zoomControlsHTML = $('.zoom-controls-content').html();

    $.each($imageZoomContainers, function (_, container) {
        var $container = $(container);
        $container.prepend(zoomControlsHTML);
    });
}

/**
 * Zoom events cleanup
 */
function destroyZoomEvents() {
    $('.zoomable-image-container').trigger('zoom.destroy');
}

module.exports = function imageZoom() {
    $('body').on('touchstart click', '.zoom-activate', handleZoomInClick);
    $('body').on('touchstart click', '.zoom-deactivate', handleZoomOutClick);

    // Before the product variant is selected
    $('body').on('product:beforeAttributeSelect', destroyZoomEvents);

    // After the product variant is selected
    $('body').on('product:afterAttributeSelect', initZoomEvents);
};
