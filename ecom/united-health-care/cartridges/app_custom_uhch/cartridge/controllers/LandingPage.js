var PageMgr = require('dw/experience/PageMgr');
var URLUtils = require('dw/web/URLUtils');

exports.Show = function () {
    var page = PageMgr.getPage(request.httpParameterMap.cid.stringValue);
    var content = PageMgr.renderPage(page.ID, '');

    if (page != null && page.isVisible()) {
        response.writer.print(content);
    } else {
        response.redirect(URLUtils.httpsHome().toString());
    }
};

exports.Show.public = true;
