'use strict';

var Transaction = require('dw/system/Transaction');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Logger = require('dw/system/Logger');

/**
 * Job to clean up the Lifestyle data from the custom object
 *
 */
function execute() {
    try {
        var previousDay = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1);
        var queryString = 'creationDate >= {0}';
        var customObjectIterator = CustomObjectMgr.queryCustomObjects('LifestyleAnswer', queryString, 'creationDate asc', previousDay);
        while (customObjectIterator && customObjectIterator.hasNext()) {
            var customObject = customObjectIterator.next();
            // eslint-disable-next-line no-loop-func
            Transaction.wrap(function () {
                CustomObjectMgr.remove(customObject);
            });
        }
    } catch (error) {
        Logger.error('error while executing the Lifestyle cleanup job');
    }
}

module.exports.execute = execute;
