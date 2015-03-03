var repl = require('repl'),
    local = repl.start("strap-sdk> "),
    StrapSDK = require('./');

local.context.strapSDK = new StrapSDK( JSON.parse(process.argv[2]) );
local.context.logger = function (e, r) {
    console.log('err: ', e);
    console.log('res: ', r);
};

local.context.strapSDK.on('error', function(e) {
	console.log('err: ', e);
})
