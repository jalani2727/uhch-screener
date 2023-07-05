var PageMgr = require('dw/experience/PageMgr');
var URLUtils = require('dw/web/URLUtils');

exports.Show = function () {
    var getId = (typeof request !== 'undefined') ? request.httpParameterMap.cid.stringValue : null;
    var page = PageMgr.getPage(getId);
    var content = PageMgr.renderPage(page.ID, '');

    if (typeof response !== 'undefined') {
      if (page != null && page.isVisible()) {
        response.writer.print(content);
      } else {
        response.redirect(URLUtils.httpsHome().toString());
      }
    }
};

exports.Show.public = true;
