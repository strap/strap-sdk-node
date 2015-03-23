/**
 * lib/resource.js
 * Strap SDK resource logic
 *
 * (C) Strap LLC 2015
 */

var _ = require('lodash'),
    request = require('request'),
    async = require('async'),
    qs = require('querystring'),
    debug = require('debug')('strap:resource'),
    Iterator = require('./iterator');

/**
 * Resource constructor
 *
 * @param token API token to be used with requests
 * @param service Service reference for resource
 */
function Resource (token, service) {
    // Capture refs
    this.token = token;
    this.service = service;

    // Determine if resource is iterable
    this.iterable = !!(service.optional && ~service.optional.indexOf('page'));
}

/**
 * get
 * Performs GET request on resource
 *
 * @param params Parameters to deliver to request
 * @param cb Callback function to deliver results to
 */
Resource.prototype.get = function (params, cb) {
    // Reference self
    var resource = this;

    // Stub error
    var err;

    // Allow an id string rather than object
    var id;
    if(typeof params === "string") {
        id = params;
        params = {};
    }

    // Shorthand some references
    var definition = resource.service,
        method = definition.method;

    // Request default options
    var reqOpts = {
        method: method,
        headers: {"X-Auth-Token": resource.token },
        json: true
    };

    // Replace path parameters
    reqOpts.uri = definition.uri.replace(/{([^{}]+)}/g, function(match, param) {
        // Provide string identifier
        if (id) return id;

        // Capture provided value
        var val = params[param];

        // Check provided; delete from query
        if (params[param]) {
            delete params[param];
            return val;
        }

        // Empty return
        return '';
    });

    // Attach query
    var query = _.pick(params, definition.optional);
    if (_.size(query)) reqOpts.uri += '?' + qs.stringify(query);

    debug('Request Info', reqOpts);

    // Perform request
    request(reqOpts, function (err, res, body) {
        // Check for failure
        if (err) return cb(err);
        if (res.statusCode >= 400) return cb(body);

        // Capture pagination info
        var hdr = res.headers;
        var meta = {
            page: +hdr["x-page"],
            pages: +hdr["x-pages"],
            next: +hdr["x-next-page"]
        };

        // Deliver result
        cb(null, body, meta);
    });
};

/**
 * all
 * Fetches all resource records
 *
 * @param params Parameter to deliver with request
 * @param cb Callback function to deliver results to
 */
Resource.prototype.all = function (params, cb) {
    // Fail if not iterable
    if (!this.iterable) return cb('Resource not iterable');

    // Reference self
    var resource = this,
        records = [];

    // Sanitize input
    if (typeof params === 'function') {
        cb = params;
        params = {};
    }
    params = params || {};

    // Create iterator
    var iter = new Iterator(this, params);

    // Fetch all
    async.whilst(function () {
        // Only continue as long as there are more pages
        return iter.hasNext();
    }, function (cb) {
        // Get next page
        iter.getNext(function (err, data) {
            // Capture records
            if (!err && data) records = records.concat(data);

            // Continue
            cb();
        });
    }, function () {
        // Deliver set of records
        cb(null, records);
    });
};

/**
 * iter
 * Delivers an iterator for the given request params
 *
 * @param params Parameters to pass to request(s)
 * @return Resource iterator
 */
Resource.prototype.iter = function (params) {
    if (!this.iterable) return false;

    return new Iterator(this, params);
};

// Export resource
module.exports = Resource;
