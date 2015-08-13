# NodeJS > Strap Server-Side SDK

Strap Server-Side SDK provides an easy to use, chainable API for interacting with our
API services.  Its purpose is to abstract away resource information from
our primary API, i.e. not having to manually track API information for
your custom API endpoint.

Strap Server-Side SDK keys off of a global API discovery object using the read token for the API.
The Strap Server-Side SDK extracts the need for developers to know, manage, and integrate the API endpoints.

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

    // is equivalent to for requests without URL parameteres
    strap.users.get(function (err, users) {

    });

    // If the resource has a path parameter, you may pass it short hand
    // like this
    strap.activity.get('userguid', function (err, activity) {

    });
});
```

### Pagination

Several strap APIs are paginated using a "page" parameter.  You have a couple options for dealing with this.

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

```javascript
    // List available endpoints
    Strap.endpoints();
    // No Params

    // Optional Param can be passed in as an array
    // Strap.activity.get( {day: "YYYY-MM-DD", guid: "demo-strap"}, callback )
    // URL resources can be passed as Strings or in the Array
    // Strap.activity.get( "demo-strap", callback )

    // Every endpoint has the get() method
    // Get a record or set of records
    Strap.activity.get( params, callback ); 

    // Fetch a user's activity
    // URL resource: "guid"
    // Optional: "date", "count", "start", "end"  >> "start" and "end" use "YYYY-MM-DD" format
    Strap.activity.get("user-guid-value", function (err, data) {
        /* etc */
    });

    // Fetch a user's behavior profile
    // URL resource: "guid"
    // Optional: none
    Strap.behavior.get("user-guid-value", function (err, data) {
        /* etc */
    });

    // Fetch the micro-segmentation job list or a individual micro-segmentation job
    // URL resource: "jobId"
    // Optional: "jobId", "status"
    Strap.job.get({params}}, function (err, data) {
        /* etc */
    });

    // Create a micro-segmentation job
    // URL resource: none
    // Requires: "name"
    // Optional: "description", "guids", "startDate", "endDate", "notificationUrl"  >> "guids" is an array of guid strings
    Strap.job.post({params}}, function (err, data) {
        /* etc */
    });

    // Fetch all user data for month
    // URL resource: none
    // Optional: "guid", "page", "per_page"
    Strap.month.get({}, function (err, data) {
        /* etc */
    });

    // Fetch a report's data
    // URL resource: "id"
    // Optional: none
    Strap.report.get("id", function (err, data) {
        /* etc */
    });

    // Fetch a report's raw data
    // URL resource: "id"
    // Optional: "type"
    Strap.raw.get({params}, function (err, data) {
        /* etc */
    });

    // Fetch the segmentation for the projet
    // URL resource: none
    // Optional: "date", "period"
    Strap.segmentation.get({}, function (err, data) {
        /* etc */
    });

    // Fetch all user data for today
    // URL resource: none
    // Optional: "guid", "page", "per_page"
    Strap.today.get({}, function (err, data) {
        /* etc */
    });

    // Fetch trigger data
    // URL resource: "id"
    // Optional: "count"
    Strap.trigger.get({id: "trigger-id"}, function (err, data) {
        /* etc */
    });

    // Fetch a simple user object
    // URL resource: "guid"
    // Optional: none
    Strap.user.get({}, function (err, data) {
        /* etc */
    });

    // Fetch a user list for the Project
    // URL resource: none
    // Optional: "platform", "count"
    Strap.users.get({}, function (err, data) {
        /* etc */
    });

    // Fetch all user data for week
    // URL resource: none
    // Optional: "guid", "page", "per_page"
    Strap.week.get({}, function (err, data) {
        /* etc */
    });
});
```

### REPL

`Strap` also ships with a repl should you be interested in playing around with it.  And example screen shot is included:

![](https://s3.amazonaws.com/f.cl.ly/items/3C2w2J0g093D0i3S3Z20/Image%202015-03-11%20at%2011.45.16%20AM.png)
