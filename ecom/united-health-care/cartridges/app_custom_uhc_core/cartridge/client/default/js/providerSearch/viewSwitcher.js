'use strict';

var domUtil = require('./utils/domUtil');
var views = domUtil.views;
var $viewElements = domUtil.$viewElements;

var currentView = views.RESULTS_VIEW;

/**
 * Switch views on provider search results page
 * @param {string} view View name
 */
function switchView(view) {
    switch (view) {
        case views.RESULTS_VIEW: {
            $viewElements.RESULTS_VIEW.show();
            $viewElements.PRACTICE_VIEW.hide();
            $viewElements.PROVIDER_VIEW.hide();
            currentView = view;
            break;
        }
        case views.PRACTICE_VIEW: {
            $viewElements.RESULTS_VIEW.hide();
            $viewElements.PRACTICE_VIEW.show();
            $viewElements.PROVIDER_VIEW.hide();
            currentView = view;
            break;
        }
        case views.PROVIDER_VIEW: {
            $viewElements.RESULTS_VIEW.hide();
            $viewElements.PRACTICE_VIEW.hide();
            $viewElements.PROVIDER_VIEW.show();
            currentView = view;
            break;
        }
        default:
            switchView(views.RESULTS_VIEW);
            break;
    }
}

module.exports = {
    currentView: currentView,
    switchView: switchView
};
