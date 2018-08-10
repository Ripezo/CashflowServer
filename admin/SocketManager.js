var instance;

var SocketManager = function(http)
{
	var io = require('socket.io')(http);

	console.log('new SocketManager();');

	return io.of('/socket');
};

exports.getInstance = function(http)
{
	if(!instance) instance = new SocketManager(http);
	
	return instance;
};