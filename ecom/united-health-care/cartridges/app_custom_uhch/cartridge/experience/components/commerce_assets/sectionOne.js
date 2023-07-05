'use strict';
/* global response */

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');

/**
 * Render logic for storefront.hero component.
 * @param {dw.experience.ComponentScriptContext} context The component script context object.
 * @param {dw.util.Map} [modelIn] Additional model values created by another cartridge. This will not be passed in by Commerce Cloud Platform.
 *
 * @returns {string} The markup to be displayed
 */
module.exports.render = function (context, modelIn) {
    var model = modelIn || new HashMap();
    var content = context.content;

    model.leftHeadline = content.leftHeadline ? content.leftHeadline : null;
    model.leftDescription = content.leftDescription ? content.leftDescription : null;

    model.rightHeadline = content.rightHeadline ? content.rightHeadline : null;
    model.rightDescription = content.rightDescription ? content.rightDescription : null;
    model.videoOneCaption = content.videoOneCaption ? content.videoOneCaption : null;
    model.videoTwoCaption = content.videoTwoCaption ? content.videoTwoCaption : null;
    model.videoAttribution = content.videoAttribution ? content.videoAttribution : null;

    // instruct 24 hours relative pagecache
    var expires = new Date();
    expires.setDate(expires.getDate() + 1); // this handles overflow automatically
    response.setExpires(expires);

    return new Template('experience/components/commerce_assets/sectionOne').render(model).text;
};
