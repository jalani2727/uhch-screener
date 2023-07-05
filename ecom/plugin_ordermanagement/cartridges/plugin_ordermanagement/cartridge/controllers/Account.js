'use strict';

var server = require('server');

server.extend(module.superModule);

server.append('Show', function (req, res, next) {
    var viewData = res.getViewData();
    viewData.orderCardContext = 'account';
    res.setViewData(viewData);
    next();
});

module.exports = server.exports();
