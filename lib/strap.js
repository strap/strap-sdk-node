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
 * options - initialization options for strap
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

Strap.prototype.setup = function() {

    var strap = this;

    _.each(strap.services, function(service) {

            // Kick back the resource reference
            var temp = _.clone( Resource );

            // Setup the details of the object
            temp.setup( strap.options.token, service.info );

            // Put it on the library
            strap[ service.name ] = temp;

    });

}

/**
 * discover
 * Instructs strap to begin service discovery
 */
Strap.prototype.discover = function discover () {
    // Reference self
    var strap = this;

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
        //debug('root discover: ', body);

        // Check error
        if (err || typeof body !== 'object' || body.success === false) {
            strap.emit('error', err || {message: "Invalid token", error: "InvalidCredentials"});
            return;
        }

        // Filter desired services
        var services = body;

        // Build list
        strap.services = _.map(services, function (obj, name) {
            // Check that it is a define endpoint
            return { name: name, info: obj };
        });

        // Setup the routes
        strap.setup();

        debug('strap loaded!');
        strap.emit('ready');

        // Queue up next discovery
        if (strap.config.interval) {
            setTimeout(strap.discover.bind(strap), strap.config.interval);
        }
    });
};

// Endpoints
Strap.prototype.endpoints = function endpoints () {

    var strap = this;

    var set = {};
    _.each(strap.services, function (service) {

        var temp = {}
        temp[service.name] = {uri: service.info.uri,
                                params: service.info.optional || [],
                                description: service.info.description }

        _.extend(set, temp);
    });
    return set;
};


// Set exports
module.exports = Strap;
