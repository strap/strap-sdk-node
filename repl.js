var repl = require('repl'),
    local = repl.start("strap> "),
    StrapSDK = require('./');

local.context.Strap = new StrapSDK( JSON.parse(process.argv[2]) );
local.context.logger = function (e, r) {
    console.log('err: ', e);
    console.log('res: ', r);
};

local.context.Strap.on('error', function(e) {
	console.log('err: ', e);
});
