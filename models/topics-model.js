var mongoose = require('mongoose');

var TopicsSchema = new mongoose.Schema({
	"Topic Level 1": {
		type: String,
	},
	"Topic Level 2": {
		type: String,
	},
	"Topic Level 3": {
		type: String,
	},
});

module.exports = mongoose.model('topics', TopicsSchema);