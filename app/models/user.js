var mongoose = require('mongoose');

module.exports = mongoose.model('User', {
	_id: String,
	twId: String,
	username: String,
	displayName: String,
	profileImage: String
});