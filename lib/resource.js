/**
 * lib/resource.js
 * Strap SDK resource logic
 *
 * (C) Strap LLC 2015
 */

var _ = require('lodash'),
    request = require('request'),
    qs = require('querystring'),
    debug = require('debug')('strap:resource');

/**
 * Resource Object to clone from
 *
 */
var Resource = {

    // Information placeholders
    service: {},
    token: "",

    // Page information
    hasNext: false,

    // Store Params
    params: {},

    // Some default values for the paging
    pageData: {},
    pageDefault: {
            page: 1,
            pages: 1,
            next: 2,
            per_page: 30
        },

    // Methods
    get: _request,
    next: _next,
    getAll: _getAll,
    setup: _setup
}

/**
 * _setup
 * Assigns the value of the Resource
 *
 * token - Read token
 * service - the definition of the service from the API
 */
function _setup(token, service) {
    // Setup some of the needed values
    this.token = token;
    this.service = service;
    this.pageData = this.pageDefault;
}

/**
 * _request
 * Performs the reques
 *
 * params - params
 * cb - callback
 * page - page information used by _next
 */
function _request (params, cb, page) {
    // Reference self
    var resource = this;

    // Stub error
    var err;

    var paramString = false;

    // Check the type of paramse
    if( typeof params === "string") { // Check for only string
        paramString = params;
        params = {};
    }

    // Setup the Paging info in the request
    var temp_page = {
                page: (params.page) ? params.page : resource.pageDefault.page,
                per_page: (params.per_page) ? params.per_page : resource.pageDefault.pre_page
    }

    resource.pageData = _.assign(temp_page, page );

    // We need to check to see if we have gone to far
    // Very important when calling on the .getAll or .next in loop
    if( resource.pageData && resource.pageData.page + 1 == resource.pageData.pages ) {
        resource.hasNext = false;
    }

    // Merge the page data into request
    // Give preference to params
    params = _.assign( resource.pageData, params );

    // Shorthand some references
    var definition = resource.service;
    var method = definition.method;

    // Request default options
    var reqOpts = {
        method: method,
        headers: {"X-Auth-Token": resource.token },
        json: true
    };

    // Replace path parameters
    reqOpts.uri = definition.uri.replace(/{([^{}]+)}/g, function(match, param) {
        // Capture provided value
        var val = "";
        if( typeof params === "object") {  // Check for array of params
            val = params[param];
        } else if( paramString ) { // Check for only string
            val = paramString
        }

        // Check provided
        if (paramString || params[param]) {
        
            if ( paramString ) { // We have a string and need to set an empty array
                params = {};
            } else if( typeof params === "object") {
                delete params[param];  // Clean out the params array of the value
            }
            return val;
        }

        // Allow get to omit path paramters
        if (method === 'get') return '';

        // Otherwise fail
        err = { message: 'Missing ' + param };
    });

    // Gather query params if get
    if (method.toLowerCase() === 'get') {
        var query = _.pick(params, definition.optional);
        if (_.size(query)) reqOpts.uri += '?' + qs.stringify(query);
    } else if (method === 'post' || method === 'put'){
        // Attach to body if post / put
        reqOpts.json = params;
    }

    debug('Request Info', reqOpts);

    // Perform request
    request(reqOpts, function (err, res, body) {
        if (err) return cb(err);
        if (res.statusCode >= 400) return cb(body);

        // Handle the paging
        debug("Headers: ", res.headers)
        var hdr = res.headers;
        if ( !hdr["x-next-page"] || hdr["x-pages"] == hdr["x-page"] ) {
            resource.hasNext = false;
            // Reset the Default Page information
            resource.pageData = resource.pageDefault;

        } else {

            // Set the main pageData
            resource.pageData = _.assign(resource.pageData, {
                                                            page: hdr["x-page"],
                                                            pages: hdr["x-pages"],
                                                            next: hdr["x-next-page"]
                                                        });

            resource.hasNext = true;
        }

        cb(null, body);
    });
};

function _next () {
    // Reference self
    var resource = this;

    if( resource.hasNext ) {

        var pageParams = {
                          page: resource.pageData.next,
                          per_page: resource.pageData.per_page,
                        }

        return resource.get(resource.params, function(err,data){
            return data;
        }, pageParams);
    } else {
        debug("There is no next()");
        return false;
    }

};

function _getAll (params, cb) {
    // Reference self
    var resource = this;

    var set = [];

    // Kickstart the fetches
    resource.get( params, getNext);

    // Used to loop over the pages
    function getNext(err, data) {
        set = set.concat( data );
            
        var pageParams = {
                          page: resource.pageData.next,
                          per_page: resource.pageData.per_page,
                        }

        if ( resource.hasNext ){
            resource.get( resource.params, getNext, pageParams);
        } else {
            // Callback
            cb(set);
        }
    }
};

// Export resource
module.exports = Resource;
