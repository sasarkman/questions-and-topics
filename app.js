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
		console.log('Could not connect to database, exiting...');
		process.exit(0);
	}
	console.log('Connected to database: ' + mongo_url);
});

const Questions = require('./models/questions-model');
const Topics = require('./models/topics-model');
app.get('/search', query('q').notEmpty(), function(req, res) {
	const errors = validationResult(req);
	if(!errors.isEmpty()) {
		return res.status(400).send('Please specify a topic in the "q" query string');
	}

	const query = req.query.q;

	// Get all topics whose Topic Level 1 match the query provided
	Topics.find({'Topic Level 1': query}, { '_id': 0, 'Topic Level 2': 1, 'Topic Level 3': 1}, function(err, docs) {
		// Based on topic level 1, compile a list of all unique topics from level 2 and 3
		var targetTopics = []
		for(var topics in docs) {
			if(docs[topics]['Topic Level 2'] != '' && !targetTopics.includes(docs[topics]['Topic Level 2'])) targetTopics = targetTopics.concat(docs[topics]['Topic Level 2']);
			if(docs[topics]['Topic Level 3'] != '' && !targetTopics.includes(docs[topics]['Topic Level 3'])) targetTopics = targetTopics.concat(docs[topics]['Topic Level 3']);
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
			function(err, docs) {
				if(err || !docs.length) res.status(400).send('No such topic found')
				else {
					var cleanedQuestions = [];

					// Remove questions whose annotations are not a sub-topic of our Level 1 topic
					docs.forEach(element => {
						if(!targetTopics.includes(element['Annotation 1']) && element['Annotation 1'] != "") return;
						if(!targetTopics.includes(element['Annotation 2']) && element['Annotation 2'] != "") return;
						if(!targetTopics.includes(element['Annotation 3']) && element['Annotation 3'] != "") return;
						if(!targetTopics.includes(element['Annotation 4']) && element['Annotation 4'] != "") return;
						if(!targetTopics.includes(element['Annotation 5']) && element['Annotation 5'] != "") return;
						cleanedQuestions = cleanedQuestions.concat(element['Question number']);
					})

					return res.status(200).send(cleanedQuestions);
				}
			}
		);
	})
});

// Express IP and port info
app.set('port', process.env.PORT);
app.set('ip', process.env.IP);

// Start HTTP server
app.listen(app.get('port'), app.get('ip'), function() {
	console.log(`Example app listening on port ${app.get('ip')}:${app.get('port')}`);
});