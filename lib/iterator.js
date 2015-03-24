/**
 * lib/iterator.js
 * Handles paginated API requests
 *
 * (C) Strap LLC 2015
 */

var debug = require('debug')('strap:iterator');

/**
 * Iterator constructor
 *
 * @param resource Resource instance to iterate over
 * @param params user provided request parameters
 */
function Iterator (resource, params) {
    // Defaults
    this.page = 0;
    this.pages = 1;
    this.complete = false;

    // Capture context
    this.params = params || {};
    this.resource = resource;
}

/**
 * hasNext
 * Determines if there are more pages to retrieve
 *
 * @return bool
 */
Iterator.prototype.hasNext = function () {
    return this.page < this.pages;
};

/**
 * getNext
 * Fetch next page of data
 *
 * @param cb callback to deliver result to
 */
Iterator.prototype.getNext = function (cb) {
    // Fail if complete
    if (this.complete) return cb('Iteration complete');

    // Reference self
    var iter = this;

    // Setup pages
    iter.page++;
    iter.params.page = iter.page;

    debug('getting page: ', iter.page);

    // Send request
    this.resource.get(iter.params, function (err, data, meta) {
        // Bail on error
        if (err) return cb(err);

        // Capture page info
        iter.page = meta.page;
        iter.pages = meta.pages;
        iter.complete = iter.page === iter.pages;

        cb(null, data);
    });
};

// Export Iterator
module.exports = Iterator;
