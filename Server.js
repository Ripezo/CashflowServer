console.log('Iniciando Servidor...');

let CashflowServer 	= require('express')();
let http 			= require('http').Server(CashflowServer).listen(10205);

let SocketManager 	= require('./admin/SocketManager').getInstance(http);

CashflowServer.use(function(request, response, next)
{
	response.header('Access-Control-Allow-Origin', "*");
	response.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE');
	response.header('Access-Control-Allow-Headers', "Authorization, X-Requested-With, Accept, Content-Type, Origin, Cache-Control, X-File-Name");
	next();
});

CashflowServer.get('/', function(request, response)
{
	response.send('Hey!');
});

let Mongoose = require('mongoose');
	Mongoose.connect('mongodb://localhost:27017/cashflow');

let UserManager = require('./admin/UserManager').getInstance();

let DataBase = Mongoose.connection;
	DataBase.on('error', console.error.bind(console, 'Error al iniciar la base de datos.'));
	DataBase.once('open', (error, response) =>
	{
		console.log("Base de datos conectada correctamente.");

		UserManager.addEventListeners();
		//ProjectManager.addEventListeners();
		
		console.log("Servidor iniciado correctamente.");
	});