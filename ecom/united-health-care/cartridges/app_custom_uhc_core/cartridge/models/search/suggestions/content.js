/* eslint-disable eqeqeq */
'use strict';

var base = module.superModule;

var URLUtils = require('dw/web/URLUtils');

/**
 * @constructor
 * @classdesc ContentSuggestions class
 *
 * @param {dw.suggest.SuggestModel} suggestions - Suggest Model
 * @param {number} maxItems - Maximum number of content items to retrieve
 */
function ContentSuggestions(suggestions, maxItems) {
    base.call(this, suggestions, maxItems);
    this.contents = [];
    var contentSuggestions = suggestions.contentSuggestions;
    var iter = (contentSuggestions && contentSuggestions.suggestedContent ? contentSuggestions.suggestedContent : null);

    for (var i = 0; i < maxItems; i++) {
        var content;
        var contentURL = '';

        if (iter && iter.hasNext()) {
            content = iter.next().content;
            var type = content.custom.articleIdentifier;
            if (type == 'article' && content.custom.articleContent) {
                contentURL = content.custom.articleContent.getAbsURL();
            } else if (type == 'video' && content.custom.videoID) {
                contentURL = content.custom.videoID;
            }
            this.contents.push({
                name: content.name,
                url: URLUtils.url('Page-Show', 'cid', content.ID),
                type: content.custom.articleIdentifier,
                contentURL: contentURL,
                ID: content.ID
            });
        }
    }
}

module.exports = ContentSuggestions;
