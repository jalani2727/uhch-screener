'use strict';

/**
 * @namespace Page
 */

var server = require('server');
server.extend(module.superModule);

/**
 * Page-DynamicSlot : This end point will render a content Slot from the content assets
 * @name Base/Page-DynamicSlot
 * @function
 * @memberof Page
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('DynamicSlot', function (req, res, next) {
    res.render('/components/content/dynamicSlot');
    next();
});

module.exports = server.exports();
