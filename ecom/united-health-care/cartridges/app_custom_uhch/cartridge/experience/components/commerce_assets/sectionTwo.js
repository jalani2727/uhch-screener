'use strict';
/* global response */

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var ImageTransformation = require('*/cartridge/experience/utilities/ImageTransformation.js');

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

    model.leftImage = ImageTransformation.getScaledImage(content.leftImage);
    model.leftAlt = content.leftAlt ? content.leftAlt : null;

    model.rightHeadline = content.rightHeadline ? content.rightHeadline : null;
    model.rightParagraph = content.rightParagraph ? content.rightParagraph : null;
    model.buttonText = content.buttonText ? content.buttonText : null;
    model.buttonLink = content.buttonLink ? content.buttonLink : null;

    // instruct 24 hours relative pagecache
    var expires = new Date();
    expires.setDate(expires.getDate() + 1); // this handles overflow automatically
    response.setExpires(expires);

    return new Template('experience/components/commerce_assets/sectionTwo').render(model).text;
};
