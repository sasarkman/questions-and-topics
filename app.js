// Load HTTP module
const express = require('express');
const bodyParser = require('body-parser');

// Initialize express
const app = express();

// Module for credentials loading
require('dotenv').config();

// Console logging
const morgan = require('morgan');
app.use(morgan('short'));

// Mongodb connection string
const mongo_url = process.env.MONGODB_URL;

// Load object relational model module
const mongoose = require('mongoose');

mongoose.connect(mongo_url, { useNewUrlParser:true, useUnifiedTopology:true }, (err) => {
	if (err) {
		console.log(err);
		console.log('Could not connect to database, exiting...');
		process.exit(0);
	}
	console.log('Connected to database: ' + mongo_url);
});

// Load user input validator
const { query, validationResult } = require('express-validator');

// Database models
const Questions = require('./models/questions-model');
const Topics = require('./models/topics-model');

// The /search route (GET) takes in a root topic and returns a list of question numbers whose annotations contain sub-topics belonging to the root topic
app.get('/search', query('q').trim().notEmpty(), function(req, res) {
	// Validate input
	const errors = validationResult(req);
	if(!errors.isEmpty()) {
		return res.status(400).send('Please specify a topic in the "q" query string');
	}

	// User's topic input
	const userTopic = req.query.q;

	// User's topic as an exact match, case-insensitive query
	const query = {
		'$regex': `^${userTopic}$`,
		'$options': 'i'
	}

	// Get all topics whose Topic Level 1 match the query provided
	Topics.find(
		// Our query parameter
		{'Topic Level 1': query}, 
		// We only care for columns "Topic Level 2" and "Topic Level 2"
		{ '_id': 0, 'Topic Level 2': 1, 'Topic Level 3': 1}, 
		function(err, topics) {
			if(err || !topics.length) return res.status(400).send(`No such topics found for topic "${userTopic}"`)

			// Based on topic level 1, compile a list of all unique topics from level 2 and 3
			var targetTopics = []
			for(var topic in topics) {
				if(topics[topic]['Topic Level 2'] != '' && !targetTopics.includes(topics[topic]['Topic Level 2'])) targetTopics = targetTopics.concat(topics[topic]['Topic Level 2']);
				if(topics[topic]['Topic Level 3'] != '' && !targetTopics.includes(topics[topic]['Topic Level 3'])) targetTopics = targetTopics.concat(topics[topic]['Topic Level 3']);
			}

			// Find all questions whose annotations contain any of our target topics
			Questions.find(
				{
					$or: [
						{'Annotation 1': {$in: targetTopics}},
						{'Annotation 2': {$in: targetTopics}},
						{'Annotation 3': {$in: targetTopics}},
						{'Annotation 4': {$in: targetTopics}},
						{'Annotation 5': {$in: targetTopics}},
					]
				},
				// Define specific columns we want returned
				{ 
					"_id": 0, 
					"Question number": 1, 
					"Annotation 1": 1, 
					"Annotation 2": 1, 
					"Annotation 3": 1, 
					"Annotation 4": 1, 
					"Annotation 5": 1
				},
				function(err, questions) {
					if(err || !questions.length) return res.status(400).send(`No such questions found for topic "${userTopic}"`)
					else {
						var cleanedQuestions = [];

						// Remove questions whose annotations are not a sub-topic of our Level 1 topic
						questions.forEach(question => {
							if(!targetTopics.includes(question['Annotation 1']) && question['Annotation 1'] != "") return;
							if(!targetTopics.includes(question['Annotation 2']) && question['Annotation 2'] != "") return;
							if(!targetTopics.includes(question['Annotation 3']) && question['Annotation 3'] != "") return;
							if(!targetTopics.includes(question['Annotation 4']) && question['Annotation 4'] != "") return;
							if(!targetTopics.includes(question['Annotation 5']) && question['Annotation 5'] != "") return;
							cleanedQuestions = cleanedQuestions.concat(question['Question number']);
						})

						return res.status(200).send(cleanedQuestions);
					}
				}
			);
		}
	)
});

// Express IP and port info
app.set('port', process.env.PORT);
app.set('ip', process.env.IP);

// Start HTTP server
app.listen(app.get('port'), app.get('ip'), function() {
	console.log(`Example app listening on port ${app.get('ip')}:${app.get('port')}`);
});