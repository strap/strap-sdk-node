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

### Usage

Below is a basic use case.

```javascript
// Setup strap SDK, passing in the Read Token for the Project
var Strap = require('strap')({ token: "{Read Token for Strap Project}" });

// Tell Strap to get started
Strap.discover();

// Listen for ready before interacting with Strap
Strap.on('ready', function () {
    
	// List available endpoints
    Strap.endpoints();
    // No Params

    //Optional Param can be passed in as an array
    // Strap.getActivity( [day: "YYYY-MM-DD", guid: "demo-strap"] )
    //URL resources can be passed as Strings or in the Array
    // Strap.getActivity( "demo-strap" )

    // Fetch a user's activity
    // URL resource: "guid"
    // Optional: "day", "count", "start", "end"  >> "start" and "end" use "YYYY-MM-DD" format
    Strap.getActivity("user-guid-value", function (err, data) {
        /* etc */
    });

    // Fetch a report's data
    // URL resource: "id"
    // Optional: none
    Strap.getReport("id", function (err, data) {
        /* etc */
    });

    // Fetch all user data for today
    // URL resource: none
    // Optional: "guid", "page"
    Strap.getToday({}, function (err, data) {
        /* etc */
    });

    // Fetch trigger data
    // URL resource: "id"
    // Optional: "count"
    Strap.getTrigger({id: "trigger-id"}, function (err, data) {
        /* etc */
    });

    // Fetch a user list for the Project
    // URL resource: none
    // Optional: "platform", "count"
    Strap.getUsers({}, function (err, users) {
        /* etc */
    });
});
```

### REPL

`Strap` also ships with a repl should you be interested in playing around with it.  And example screen shot is included:

![](https://s3.amazonaws.com/f.cl.ly/items/3C2w2J0g093D0i3S3Z20/Image%202015-03-11%20at%2011.45.16%20AM.png)
