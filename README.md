# strapSDK

Strap SDK Node provides an easy to use, chainable API for interacting with our
API services.  Its purpose is to abstract away resource information from
our primary API, i.e. not having to manually track API information for
your custom API endpoint.

Strap SDK Node keys off of a global API discovery object using the read token for the API. 
The Strap SDK Node extracts the need for developers to know, manage, and integrate the API endpoints.

The a Project API discovery can be found here:

HEADERS: "x-auth-token": 
GET [https://api2.straphq.com/discover]([https://api2.straphq.com/discover)

Once the above has been fetched, `strapSDK` will fetch the API discover
endpoint for the project and build its API.

### Installation

```
npm install git+ssh://git@github.com:strap/strap-sdk-node.git
```

### Usage

Below is a basic use case.

```javascript
// Setup strapSDK, passing in the Read Token for the Project
var StrapSDK = require('strapSDK'),
    strapSDK = new StrapSDK({ token: "{Read Token for Strap Project}" });

// Tell strapSDK to get started
strapSDK.discover();

// Listen for ready before interacting with strapSDK
strapSDK.on('ready', function () {
    // Fetch a user list for the Project
    strapSDK.users({}, function (err, users) {
        /* etc */
    });

    // Fetch a user's data for today
    strapSDK.today({guid: "user-guid-value"}, function (err, data) {
        /* etc */
    });;
});
```

### REPL

`strapSDK` also ships with a repl should you be interested in playing around with it.  And example screen shot is included:

![](https://s3.amazonaws.com/f.cl.ly/items/2z0I3P0N0O213r2T1t3D/Image%202015-03-03%20at%201.00.13%20PM.png)
