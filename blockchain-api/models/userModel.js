var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var userSchema = new Schema({
	'username' : String,
	'email' : String,
	'password' : String,
	'public_key' : String,
	'private_key' : String
});

module.exports = mongoose.model('user', userSchema);
