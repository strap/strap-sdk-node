/**
 * lib/strapSDK.js
 * Main strapSDK logic
 *
 * (C) Strap LLC 2015
 */

var _ = require('lodash'),
    util = require('util'),
    url = require('url'),
    EventEmitter = require('events').EventEmitter,
    nconf = require('nconf'),
    request = require('request'),
    debug = require('debug')('strapSDK:main'),
    Resource = require('./resource');

// Setup nconf
nconf.argv().env().file({ file: __dirname + '/../conf.json' });

/**
 * StrapSDK constructor
 *
 * options - initialization options for strapSDK
 */
function StrapSDK (options) {
    // Inherit from eventemitter
    EventEmitter.call(this);

    // Capture options
    this.options = options || {};

    // Setup config
    this.config = nconf.get('discovery');

    // Allow interval to be overwritten
    if (options.interval) this.config.interval = options.interval;
}

// Set prototype
util.inherits(StrapSDK, EventEmitter);

/**
 * discover
 * Instructs strapSDK to begin service discovery
 */
StrapSDK.prototype.discover = function discover () {
    // Reference self
    var strapSDK = this;

    if(!this.options.token) {
        strapSDK.emit('error', {message: "Please set the token when initializing strapSDK", error: "InvalidCredentials"});
        return;
    }

    // Request root discover object
    debug('requesting: ', strapSDK.config.url);
    request({
        uri: strapSDK.config.url,
        method: 'GET',
        json: true,
        headers: {"x-auth-token": this.options.token }
    }, function (err, res, body) {
        debug('root discover: ', body);

        // Check error
        if (err || typeof body !== 'object' || body.success === false) {
            strapSDK.emit('error', err || {message: "Invalid token", error: "InvalidCredentials"});
            return;
        }

        // Filter desired services
        var services = body;

        // Build list
        strapSDK.services = _.map(services, function (obj, name) {
            return { name: name, info: obj };
        });

        // Load desired services
        strapSDK._load(function () {
            debug('strapSDK loaded!');
            strapSDK.emit('ready');
        });


        // Queue up next discovery
        if (strapSDK.config.interval) {
            setTimeout(strapSDK.discover.bind(strapSDK), strapSDK.config.interval);
        }
    });
};

/**
 * _load
 * Loads each service provided in services
 *
 * cb - function to notify when complete
 */
StrapSDK.prototype._load = function _load (cb) {
    // Reference self
    var strapSDK = this;

    // Load each service
    _.each(strapSDK.services, function (service) {
        debug('exposing ' + service.name);

        service.info.token = strapSDK.options.token;

        // Handle resource payload
        _.extend(strapSDK, strapSDK._handle( service.info, service.name ) );
    });
    cb();
};

/**
 * _handle
 * Receives individual service discovery payload and extends
 * strapSDK object with API
 *
 * discovery - discovery object for service
 * @return api object for service
 */
StrapSDK.prototype._handle = function _handle (service, name) {
    // Stub api
    var api = {};

    api[name] = new Resource(service, name);

    // Deliver built api
    return api;
};

// Set exports
module.exports = StrapSDK;
