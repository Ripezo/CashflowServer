var SocketManager 	= require('../admin/SocketManager').getInstance();
var Lodash			= require('lodash');
var User 			= require('../models/UserModel');
var instance = null;

function UserManager()
{
	console.log('new UserManager();');
	this.currentUsers = [];
}

UserManager.prototype.constructor = UserManager;

UserManager.prototype.addEventListeners = function()
{
	SocketManager.on('connection', function(socket)
	{
		socket.emit('whois');
		socket.on('user-login', function(data){ this.login(socket, data); }.bind(this));
		socket.on('user-register', function(data){ this.register(socket, data); }.bind(this));
	}.bind(this));
};

UserManager.prototype.login = function(socket, data)
{

	console.log(data);
	var currentUser = Lodash.find(this.currentUsers, function(user) { return user.token == data.token; });

	console.log(currentUser);
	if(currentUser)
	{
		this.saveUser(socket, currentUser, data);
	}
	else
	{
		User.findOne({ token : data.token }, function(error, userFound)
		{
			console.log(userFound);
			if(userFound)
			{
				this.currentUsers.push(userFound);
				this.saveUser(socket, userFound, data);
			}
			else
			{
				socket.emit('login', { success : false, error : 'Email o Password incorrecto.' });
			}
		}.bind(this));
	}
};

UserManager.prototype.saveUser = function(socket, user, data)
{
	user.socketId = socket.id;
	user.markModified('socketId');
	user.save(function (error, savedUser)
	{
		if(error)
		{
			console.log('Error al actualizar el token del usuario.', error);
			console.log('------');
			socket.emit('login', { success : false, error : 'Error al actualizar el token del usuario.' });
		}
		else
		{
			console.log(savedUser.name + ' se ha conectado.');
			data.name = user.name;
			socket.emit('login', { success : data });
		}
	});
};

UserManager.prototype.register = function(socket, data)
{
	User.findOne({ email : data.email }, function(error, userFound)
	{
		if(userFound)
		{
			socket.emit('register', {
				success : false,
				error : 'Esta cuenta de correo ya está registrado.'
			});
		}
		else
		{
			var user = new User({
				name : data.name,
				email : data.email,
				token : data.token,
				socketId : socket.id
			});

			user.save(function (error, savedUser)
			{
				if(error)
				{
					console.log('Error al añadir un nuevo usuario a la Base de Datos.');
					console.log(error);
					console.log('------');
					socket.emit('register', { success : false, error : 'Error al guardar usuario en la Base de Datos.' });
				}
				else
				{
					console.log('Un nuevo usuario ha sido creado:');
					console.log(savedUser);
					console.log('------');
					socket.emit('register', { success : data });
				}
			});
		}
	});
};

exports.getInstance = function ()
{
	if (instance == null) instance = new UserManager();
	return instance;
};