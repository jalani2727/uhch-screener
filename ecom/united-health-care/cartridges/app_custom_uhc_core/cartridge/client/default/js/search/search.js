'use strict';

var productPrices = window.productPrices;
/**
 * Update DOM elements with Ajax results
 *
 * @param {Object} $results - jQuery DOM element
 * @param {string} selector - DOM element to look up in the $results
 * @return {undefined}
 */
function updateDom($results, selector) {
    var $updates = $results.find(selector);
    $(selector).empty().html($updates.html());
}

/**
 * Keep refinement panes expanded/collapsed after Ajax refresh
 *
 * @param {Object} $results - jQuery DOM element
 * @return {undefined}
 */
function handleRefinements($results) {
    $('.refinement.active').each(function () {
        $(this).removeClass('active');
        var activeDiv = $results.find('.' + $(this)[0].className.replace(/ /g, '.'));
        activeDiv.addClass('active');
        activeDiv.find('button.title').attr('aria-expanded', 'true');
    });

    updateDom($results, '.refinements');
}

/**
 * Parse Ajax results and updated select DOM elements
 *
 * @param {string} response - Ajax response HTML code
 * @return {undefined}
 */
function parseResults(response) {
    var $results = $(response);
    var specialHandlers = {
        '.refinements': handleRefinements
    };

    // Update DOM elements that do not require special handling
    [
        '.grid-header',
        '.header-bar',
        '.header.plp-page-title',
        '.product-grid',
        '.show-more',
        '.filter-bar'
    ].forEach(function (selector) {
        updateDom($results, selector);
    });

    Object.keys(specialHandlers).forEach(function (selector) {
        specialHandlers[selector]($results);
    });
}

/**
 * Update technology level refinement base on Customer
 */
function refinementUpdateBasedOnCustomer() {
    if ($('.js-guest-customer').length > 0 && $('.id-technologyLevel').length > 0) {
        $('.id-technologyLevel').remove();
    } else if ($('.js-registered-customer').length > 0 && $('.id-technologyLevelGuest').length > 0) {
        $('.id-technologyLevelGuest').remove();
    }
}

/**
 * This function retrieves another page of content to display in the content search grid
 * @param {JQuery} $element - the jquery element that has the click event attached
 * @param {JQuery} $target - the jquery element that will receive the response
 * @return {undefined}
 */
function getContent($element, $target) {
    var showMoreUrl = $element.data('url');
    $.spinner().start();
    $.ajax({
        url: showMoreUrl,
        method: 'GET',
        success: function (response) {
            $target.append(response);
            refinementUpdateBasedOnCustomer();
            $.spinner().stop();
        },
        error: function () {
            $.spinner().stop();
        }
    });
}

/**
 * Update sort option URLs from Ajax response
 *
 * @param {string} response - Ajax response HTML code
 * @return {undefined}
 */
function updateSortOptions(response) {
    var $tempDom = $('<div>').append($(response));
    var sortOptions = $tempDom.find('.grid-footer').data('sort-options').options;
    sortOptions.forEach(function (option) {
        $('option.' + option.id).val(option.url);
    });
}

/**
 * Update product tile price or sign in message based
 * on the product type and also the type of the product
 */
function updatePrice() {
    $('.product').each(function () {
        var pid = $(this).data('pid');
        if (productPrices[pid]) {
            $(this).find('.price').html('');
            var newPrice;
            if (productPrices[pid].signInMessage) {
                $(this).find('.price').removeClass('price').addClass('price-sign-in');
                if ($(this).find('.price-sign-in .sign-in-message').length === 0) {
                    var signInHTML = "<span class='sign-in-message'></span>";
                    $(this).find('.price-sign-in').prepend(signInHTML);
                    $(this).find('.sign-in-message').text(productPrices[pid].signInMessage);
                }
            } else if ('type' in productPrices[pid] && productPrices[pid].type === 'range') {
                if (productPrices[pid].min.sales.formatted) {
                    var newMinprice = productPrices[pid].min.sales.formatted;
                    var minPriceHTML = "<span class='sales'> <span class='value min'> </span> </span>";
                    $(this).find('.price').prepend(minPriceHTML);
                    $(this).find('.sales .value.min').text(newMinprice);
                }
                if (productPrices[pid].max.sales.formatted) {
                    var newMaxprice = productPrices[pid].max.sales.formatted;
                    var maxPriceHTML = "<span class='sales'> <span class='value max'> </span> </span>";
                    $(this).find('.price').prepend(maxPriceHTML);
                    $(this).find('.sales .value.max').text(newMaxprice);
                }
            } else {
                newPrice = productPrices[pid].sales.formatted;
                var salesPriceHTML = "<span class='sales'> <span class='value'> </span> </span>";
                $(this).find('.price').prepend(salesPriceHTML);
                $(this).find('.sales .value').text(newPrice);
                if (productPrices[pid].list) {
                    var listPriceHTML = "<span class='strike-through list'> <span class='value'> </span> </span>";
                    var newListprice = productPrices[pid].list.formatted;
                    if ($(this).find('.strike-through .value').length === 0) {
                        $(this).find('.price').prepend(listPriceHTML);
                    }
                    $(this).find('.strike-through .value').text(newListprice);
                }
            }
        }
    });
}

updatePrice();
refinementUpdateBasedOnCustomer();

module.exports = {
    filter: function () {
        // Display refinements bar when Menu icon clicked
        $('.container').on('click', 'button.filter-results', function () {
            $('.refinement-bar, .modal-background').show();
            $('.refinement-bar').siblings().attr('aria-hidden', true);
            $('.refinement-bar').closest('.row').siblings().attr('aria-hidden', true);
            $('.refinement-bar').closest('.tab-pane.active').siblings().attr('aria-hidden', true);
            $('.refinement-bar').closest('.container.search-results').siblings().attr('aria-hidden', true);
            $('.refinement-bar .close').focus();
        });
    },

    closeRefinements: function () {
        // Refinements close button
        $('.container').on('click', '.refinement-bar button.close, .modal-background', function () {
            $('.refinement-bar, .modal-background').hide();
            $('.refinement-bar').siblings().attr('aria-hidden', false);
            $('.refinement-bar').closest('.row').siblings().attr('aria-hidden', false);
            $('.refinement-bar').closest('.tab-pane.active').siblings().attr('aria-hidden', false);
            $('.refinement-bar').closest('.container.search-results').siblings().attr('aria-hidden', false);
            $('.btn.filter-results').focus();
        });
    },

    resize: function () {
        // Close refinement bar and hide modal background if user resizes browser
        $(window).resize(function () {
            $('.refinement-bar, .modal-background').hide();
            $('.refinement-bar').siblings().attr('aria-hidden', false);
            $('.refinement-bar').closest('.row').siblings().attr('aria-hidden', false);
            $('.refinement-bar').closest('.tab-pane.active').siblings().attr('aria-hidden', false);
            $('.refinement-bar').closest('.container.search-results').siblings().attr('aria-hidden', false);
        });
    },

    sort: function () {
        // Handle sort order menu selection
        $('.container').on('change', '[name=sort-order]', function (e) {
            e.preventDefault();

            $.spinner().start();
            $(this).trigger('search:sort', this.value);
            $.ajax({
                url: this.value,
                data: { selectedUrl: this.value },
                method: 'GET',
                success: function (response) {
                    $('.product-grid').empty().html(response);
                    refinementUpdateBasedOnCustomer();
                    var priceElement = $('input[name=price-obj]').val();
                    try {
                        var prices = JSON.parse(priceElement);
                        $.extend(productPrices, prices);
                        updatePrice();
                    } catch (error) {
                        $.spinner().stop();
                    }
                    $.spinner().stop();
                },
                error: function () {
                    $.spinner().stop();
                }
            });
        });
    },

    showMore: function () {
        // Show more products
        $('.container').on('click', '.show-more button', function (e) {
            e.stopPropagation();
            var showMoreUrl = $(this).data('url');
            e.preventDefault();

            $.spinner().start();
            $(this).trigger('search:showMore', e);
            $.ajax({
                url: showMoreUrl,
                data: { selectedUrl: showMoreUrl },
                method: 'GET',
                success: function (response) {
                    $('.grid-footer').replaceWith(response);
                    refinementUpdateBasedOnCustomer();
                    var priceElement = $('input[name=price-obj]').last().val();
                    try {
                        var prices = JSON.parse(priceElement);
                        $.extend(productPrices, prices);
                        updatePrice();
                    } catch (error) {
                        $.spinner().stop();
                    }
                    updateSortOptions(response);
                    $.spinner().stop();
                },
                error: function () {
                    $.spinner().stop();
                }
            });
        });
    },

    applyFilter: function () {
        // Handle refinement value selection and reset click
        $('.container').on(
            'click',
            '.refinements li button, .refinement-bar button.reset, .filter-value button, .swatch-filter button',
            function (e) {
                e.preventDefault();
                e.stopPropagation();

                $.spinner().start();
                $(this).trigger('search:filter', e);
                var attributeId = '#' + $(this).find('span').last().attr('id');
                $.ajax({
                    url: $(this).data('href'),
                    data: {
                        page: $('.grid-footer').data('page-number'),
                        selectedUrl: $(this).data('href')
                    },
                    method: 'GET',
                    success: function (response) {
                        parseResults(response);
                        refinementUpdateBasedOnCustomer();
                        var priceElement = $('input[name=price-obj]').val();
                        try {
                            var prices = JSON.parse(priceElement);
                            $.extend(productPrices, prices);
                            updatePrice();
                        } catch (error) {
                            $.spinner().stop();
                        }
                        $.spinner().stop();
                        $(attributeId).parent('button').focus();
                    },
                    error: function () {
                        $.spinner().stop();
                        $(attributeId).parent('button').focus();
                    }
                });
            });
    },

    showContentTab: function () {
        // Display content results from the search
        $('.container').on('click', '.content-search', function () {
            if ($('#content-search-results').html() === '') {
                getContent($(this), $('#content-search-results'));
            }
        });

        // Display the next page of content results from the search
        $('.container').on('click', '.show-more-content button', function () {
            getContent($(this), $('#content-search-results'));
            $('.show-more-content').remove();
        });
    }
};
