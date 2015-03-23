/**
 * lib/strap.js
 * Main strap logic
 *
 * (C) Strap LLC 2015
 */

var _ = require('lodash'),
    util = require('util'),
    url = require('url'),
    EventEmitter = require('events').EventEmitter,
    nconf = require('nconf'),
    request = require('request'),
    debug = require('debug')('strap:main'),
    Resource = require('./resource');

// Setup nconf
nconf.argv().env().file({ file: __dirname + '/../conf.json' });

/**
 * Strap constructor
 *
 * @param options initialization options for strap
 */
function Strap (options) {
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
util.inherits(Strap, EventEmitter);

/**
 * discover
 * Instructs strap to begin service discovery
 */
Strap.prototype.discover = function discover () {
    // Reference self
    var strap = this;

    // Fail if no token
    if(!this.options.token) {
        strap.emit('error', {message: "Please set the token when initializing strap", error: "InvalidCredentials"});
        return;
    }

    // Request root discover object
    debug('requesting: ', strap.config.url);
    request({
        uri: strap.config.url,
        method: 'GET',
        json: true,
        headers: {"X-Auth-Token": this.options.token }
    }, function (err, res, body) {
        // Check error
        if (err || typeof body !== 'object' || body.success === false) {
            strap.emit('error', err || {message: "Invalid token", error: "InvalidCredentials"});
            return;
        }

        // Capture services
        strap.services = body;

        // Extend API
        _.each(strap.services, function(obj, name) {
            // Create resource
            var resource = new Resource(strap.options.token, obj);

            // Put it on the library
            strap[name] = resource;
        });

        debug('strap loaded!');
        strap.emit('ready');

        // Queue up next discovery
        if (strap.config.interval) {
            setTimeout(strap.discover.bind(strap), strap.config.interval);
        }
    });
};

/**
 * endpoints
 * Delivers meta information on available endpoints
 */
Strap.prototype.endpoints = function endpoints () {
    var set = {};
    _.each(this.services, function (info, name) {
        set[name] = {
            uri: info.uri,
            params: info.optional || [],
            description: info.description
        };
    });
    return set;
};


// Set exports
module.exports = Strap;
