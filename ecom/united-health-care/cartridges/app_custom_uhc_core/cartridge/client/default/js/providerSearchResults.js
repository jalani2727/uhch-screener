'use strict';

require('./providerSearch/providerSearchMap');
var dataUtil = require('./providerSearch/data');
var providerSearch = require('./providerSearch/providerSearchResults');

dataUtil.setupClientData();

$(document).ready(function () {
    providerSearch.disableFields();
    providerSearch.renderFilters();
    providerSearch.renderResults();
    providerSearch.initializeFilterChangeEvents();
    providerSearch.initializeViewChangeEvents();
    providerSearch.displayAddressOnAppointmentForm();
});
