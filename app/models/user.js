var mongoose = require('mongoose');

module.exports = mongoose.model('User', {
	id: String,
	username: String,
	email: String,
	fname: String,
	lname: String,
	tw_id: String
});