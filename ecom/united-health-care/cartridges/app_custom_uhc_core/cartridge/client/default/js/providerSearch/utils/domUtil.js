'use strict';

var $body = $('body');
var $mapEl = $('#map');
var $filterContainer = $('.filter-container');
var $resultsContainer = $('.results-container');
var $uploadFileContainer = $('.upload-file-container');
var $fileUploadError = $('.file-upload-error-container');
var $virtualHearingCheck = $('.virtual-hearing-check');

var views = {
    RESULTS_VIEW: 'RESULTS_VIEW',
    PRACTICE_VIEW: 'PRACTICE_VIEW',
    PROVIDER_VIEW: 'PROVIDER_VIEW'
};

var viewsSelectors = {
    RESULTS_VIEW: '.results-view',
    PRACTICE_VIEW: '.practice-view',
    PROVIDER_VIEW: '.provider-view'
};

var viewCtaSelectors = {
    GOTO_RESULTS_VIEW: '.goto-results-view',
    GOTO_PRACTICE_VIEW: '.goto-practice-view',
    GOTO_PROVIDER_VIEW: '.goto-provider-view'
};

var $viewElements = {
    RESULTS_VIEW: $(viewsSelectors.RESULTS_VIEW),
    PRACTICE_VIEW: $(viewsSelectors.PRACTICE_VIEW),
    PROVIDER_VIEW: $(viewsSelectors.PROVIDER_VIEW)
};

module.exports = {
    views: views,
    viewsSelectors: viewsSelectors,
    viewCtaSelectors: viewCtaSelectors,
    $viewElements: $viewElements,
    $body: $body,
    $mapEl: $mapEl,
    $filterContainer: $filterContainer,
    $resultsContainer: $resultsContainer,
    $uploadFileContainer: $uploadFileContainer,
    $fileUploadError: $fileUploadError,
    $virtualHearingCheck: $virtualHearingCheck
};
