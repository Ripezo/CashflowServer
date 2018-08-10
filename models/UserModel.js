var Mongoose 	= require('mongoose');
var Schema 		= Mongoose.Schema;

var User = new Schema({
	name : { type : String, require : true },
	email : { type : String, require : true },
	token : { type : String, require : true },
	socket : { type : String, require : true }
});

module.exports = Mongoose.model('User', User);