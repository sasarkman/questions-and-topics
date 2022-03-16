var mongoose = require('mongoose');

var QuestionsSchema = new mongoose.Schema({
	"Question number": { 
		type: Number,
		required: true,
	},
	"Annotation 1": {
		type: String,
	},
	"Annotation 2": {
		type: String,
	},
	"Annotation 3": {
		type: String,
	},
	"Annotation 4": {
		type: String,
	},
	"Annotation 5": {
		type: String,
	},
});

module.exports = mongoose.model('questions', QuestionsSchema);