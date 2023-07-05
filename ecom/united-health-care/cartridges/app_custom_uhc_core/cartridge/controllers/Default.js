'use strict';

/**
 * @namespace Default
 */

var server = require('server');
server.extend(module.superModule);

/** when sitepath is defined in the site aliases from business manager, homepage will be rendered directly */
/**
 * Default-Start : This end point is the root of the site, when opening from the BM this is the end point executed
 * @name Base/Default-Start
 * @function
 * @memberof Default
 * @param {serverfunction} - get
 */
server.append('Start', function (req, res, next) {
    var viewData = res.getViewData();
    viewData.oauthLoginTargetEndPoint = 7;
    next();
});

module.exports = server.exports();
