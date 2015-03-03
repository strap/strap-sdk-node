/**
 * lib/resource.js
 * Strap SDK resource logic
 *
 * (C) Strap LLC 2015
 */

var _ = require('lodash'),
    request = require('request'),
    qs = require('querystring'),
    debug = require('debug')('strap-sdk:resource');

/**
 * Resource constructor
 *
 * service - resource obj
 * name - name of the service
 */
function Resource (service, name) {
    debug('building resource: ' + name+" at "+service.uri);

    // Reference self
    var resource = this;

    // Handle definition
    return resource._generateRequest(service.method, service);

}

/**
 * _generateRequest
 * Delivers closure with context to make request to backend service
 *
 * method - http method
 * definition - method definition to generate request for
 */
Resource.prototype._generateRequest = function _generateRequest (method, definition) {
    // Reference self
    var resource = this;

    // Deliver closure
    return function (params, cb) {
        // Stub error
        var err;

        // Request default options
        var reqOpts = {
            method: method,
            headers: {"x-auth-token": definition.token }
        };

        // Replace path parameters
        reqOpts.uri = definition.uri.replace(/{([^{}]+)}/g, function(match, param) {
            // Capture provided value
            var val = params[param];

            // Check provided
            if (params[param]) {
                delete params[param];
                return val;
            }

            // Allow get to omit path paramters
            if (method === 'get') return '';

            // Otherwise fail
            err = { message: 'Missing ' + param };
        });

        // Gather query params if get
        if (method === 'get') {
            var query = _.pick(params, definition.optional);
            if (_.size(query)) reqOpts.uri += '/' + qs.stringify(query);
        } else if (method === 'post' || method === 'put'){
            // Attach to body if post / put
            reqOpts.json = params;
        }

        debug('Request Info', reqOpts);

        // Perform request
        request(reqOpts, function (err, res, body) {
            if (err) return cb(err);
            if (res.statusCode >= 400) return cb(body);
            cb(null, body);
        });
    };
};

// Export resource
module.exports = Resource;
