// Load HTTP module
const express = require('express');
const bodyParser = require('body-parser');

// Initialize express
const app = express();

app.use(bodyParser.urlencoded({
	extended: true
 }));
app.use(bodyParser.json());

// Module for credentials loading
require('dotenv').config();

// Mongodb connection string
const mongo_url = process.env.MONGODB_URL;

// Load object relational model module
const mongoose = require('mongoose');

// Load user input validator
const { query, validationResult } = require('express-validator');

mongoose.connect(mongo_url, { useNewUrlParser:true, useUnifiedTopology:true }, (err) => {
	if (err) {
		console.log(err);
		console.log("Could not connect to database, exiting...");
		process.exit(0);
	}
	console.log("Connected to database: " + mongo_url);
});

const Questions = require('./models/questions-model');
const Topics = require('./models/topics-model');
app.get('/search', query('q').notEmpty(), function(req, res, next) {
	const errors = validationResult(req);
	if(!errors.isEmpty()) {
		return res.status(400).json({ msg: 'Missing name of topic in query' });
	}

	const query = req.query.q;

	Topics.aggregate([
		{
			$match: {
				"Topic Level 1": query
			}
		},
		{
			$lookup: {
				from: 'questions',
				localField: 'Topic Level 2',
				foreignField: 'Annotation 1',
				as: 'question'
			}
		},
		{ 
			$unwind: '$question' 
		},
		{
			$project: {
				'_id': 0,
				'question.Question number': 1
			}
		},
		
		], function(err, result) {
			if(err || !result.length) res.status(400).json({ msg: 'No such topic found'})
			else {
				const output = result.map(question => question.question['Question number']);
				return res.status(200).json(output);
			}
		}
	);

});

// Express IP and port info
app.set('port', process.env.PORT);
app.set('ip', process.env.IP);

// Start HTTP server
app.listen(app.get('port'), app.get('ip'), function() {
	console.log(`Example app listening on port ${app.get('ip')}:${app.get('port')}`);
});