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
		socket.on('login', function(data){ this.login(socket, data); }.bind(this));
		socket.on('register', function(data){ this.register(socket, data); }.bind(this));
	}.bind(this));
};

UserManager.prototype.login = function(socket, data)
{
	var currentEditor = Lodash.find(this.currentUsers, function(editor) { return editor.email == data.email; });
	if(currentEditor)
	{
		this.saveUser(socket, currentEditor);
	}
	else
	{
		User.findOne({ email : data.email }, function(error, editorFound)
		{
			if(editorFound)
			{
				if(editorFound.token == data.token)
				{
					this.currentUsers.push(editorFound);
					this.saveUser(socket, editorFound);
				}
				else
				{
					socket.emit('login', { success : false, error : 'Email o Password incorrecto.' });
				}
			}
			else
			{
				socket.emit('login', { success : false, error : 'Cuenta de correo no registrada.' });
			}
		}.bind(this));
	}
};

UserManager.prototype.saveUser = function(socket, editor)
{
	editor.socketId = socket.id;
	editor.markModified('socketId');
	editor.save(function (error, savedEditor)
	{
		if(error)
		{
			console.log('Error al actualizar el token del usuario.', error);
			console.log('------');
			socket.emit('login', { success : false, error : 'Error al actualizar el token del usuario.' });
		}
		else
		{
			console.log(savedEditor.nickname + ' se ha conectado.');
			var cookieValue = savedEditor.email + ':' + savedEditor.token;
			socket.emit('login', { success : cookieValue });
		}
	});
};

UserManager.prototype.register = function(socket, data)
{
	User.findOne({ email : data.email }, function(error, editorFound)
	{
		if(editorFound)
		{
			socket.emit('register', { success : false, error : 'Esta cuenta de correo ya está registrado.' });
		}
		else
		{
			var editor = new User({
				nickname : data.nickname,
				email : data.email,
				token : data.token,
				socketId : socket.id
			});

			editor.save(function (error, savedEditor)
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
					console.log(savedEditor);
					console.log('------');
					var cookieValue = savedEditor.email + ':' + savedEditor.token;
					socket.emit('register', { success : cookieValue });
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