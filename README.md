# NodeJS > Strap Server-Side SDK

Strap Server-Side SDK provides an easy to use, chainable API for interacting with our
API services.  Its purpose is to abstract away resource information from
our primary API, i.e. not having to manually track API information for
your custom API endpoint.

Strap Server-Side SDK keys off of a global API discovery object using the read token for the API.
The SStrap Server-Side SDK extracts the need for developers to know, manage, and integrate the API endpoints.

The a Project API discovery can be found here:

HEADERS: "X-Auth-Token":
GET [https://api2.straphq.com/discover]([https://api2.straphq.com/discover)

### Installation

```
npm install git+ssh://git@github.com:strap/strap-sdk-node.git
```

### Initialization

Once you create your strap instance, a call to `strap.discover()` must be made
before interacting with any strap API.  Once complete, strap will emit a
`ready` event.

```javascript
// Setup strap SDK, passing in the Read Token for the Project
var StrapSDK = require('strap-sdk-node'),
    strap = new StrapSDK({ token: '{Read Token for Strap Project}' });

// Tell Strap to get started
Strap.discover();

// Listen for ready before interacting with Strap
Strap.once('ready', function () {
    // Okay to use strap
});
```

### Basic Usage

Once strap has initialized, all available resources will be exposed directly on
your sdk instance.  Each resource will expose a `get` method for fetching data via
the API.

```javascript
strap.once('ready', function () {

    // Provided parameters are delivered with the request
    strap.users.get({}, function (err, users) {

    });

    // If the resource has a path parameter, you may pass it short hand
    // like this
    strap.activity.get('userguid', function (err, activity) {

    });
});
```

### Pagination

Several strap APIs are paginated.  You have a couple options for dealing with this.

First, you can use the resource `all` method to instruct the SDK to handle pagination
for you and build a list of all records.  This may be a bad idea for a large dataset.

The parameters provided to `all` may be omitted.

```javascript
strap.once('ready', function () {

    strap.week.all({}, function (err, reports) {

    });

    // is equivalent to
    strap.week.all(function (err, reports) {

    });
});
```

The second option for handling paginated requests is to create an iterator and
parse it yourself.  Here, we will use `async.whilst`.

```javascript
strap.once('ready', function () {

    // Can provide request parameters here
    var iter = strap.week.iter();

    async.whilst(function () {
        // Whether to continue
        return iter.hasNext();
    }, function (cb) {
        // Fetch next batch
        iter.getNext(function (err, reports) {

            /* handle reports */

            cb();
        });
    }, function (err) {
        // Iter complete
    });
});
```

### API

TODO

### REPL

`Strap` also ships with a repl should you be interested in playing around with it.  And example screen shot is included:

![](https://s3.amazonaws.com/f.cl.ly/items/3C2w2J0g093D0i3S3Z20/Image%202015-03-11%20at%2011.45.16%20AM.png)
