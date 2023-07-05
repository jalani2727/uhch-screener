'use strict';

var server = require('server');
var preferences = require('*/cartridge/config/preferences.js');

/**
 * Build-BuildContentView : This end point will create the content view datalayer object on storefront page
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.post('BuildContentView', function (req, res, next) {
    if (preferences.enableAdobeDataLayer) {
        let params = request.getHttpParameterMap();
        var pageInfo = {};
        pageInfo.pageGroup = params.get('pageGroup');
        pageInfo.pageName = params.get('pageName');
        pageInfo.isErrorPage = JSON.parse(params.get('isErrorPage'));
        pageInfo.Sections = JSON.parse(params.get('sections'));

        var datalayer = require('*/cartridge/scripts/datalayer.js');
        datalayer.populate(datalayer.CONTEXT.GLOBAL, req, pageInfo);

        res.render('datalayerjson', {
            contentView: JSON.stringify(datalayer.getDatalayerView())
        });
    }
    return next();
});

module.exports = server.exports();
