# waiter

Waiter provides an easy to use, chainable API for interacting with our
backend services.  Its purpose is to abstract away deployment information from
our primary APIs, i.e. not having to manually track internal ip addresses for
our deployed load balancer / server instances.

Waiter keys off of a global discovery object, currently hosted as a static
file in google storage. In the future, we should look to alter this in a way
that it can be easily updated as our deployment evolves.

The current version can be found here:

[http://storage.googleapis.com/strap-discovery/discovery](http://storage.googleapis.com/strap-discovery/discovery)

Once the above has been fetched, `waiter` will fetch each service discovery
endpoint and build its API, based on the user's desired services.

### Installation

```
npm install git+ssh://git@github.com:strap/waiter.git
```

### Usage

Below is a basic use case.

```javascript
// Setup waiter, only request vodka and absinthe services
var Waiter = require('waiter'),
    waiter = new Waiter({ only: ['vodka', 'absinthe'] });

// Tell waiter to get started
waiter.discover();

// Listen for ready before interacting with waiter
waiter.on('ready', function () {
    // Fetch a single user
    waiter.user.get({ id: 'someid' }, function (err, user) {
        /* etc */
    });

    // Post a login on behalf of a user
    waiter.login.post({
        email: 'foo@foo.com',
        password: 'foo'
    }, function (err, status) {
        /* etc */
    }});
});
```

### REPL

`waiter` also ships with a repl should you be interested in playing around with it.  And example screen shot is included:

![](https://cldup.com/2MloMlu9ps.png)
