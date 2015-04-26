var validate = require('validate.js');


/*
* Validate inputs (create/update)
* Expects a data object (user, room, comment)
* returns error message if invalid, null if valid
*/
var Validator = {};


/*
* User Validation
* Fields: username, password, email
*/
Validator.user = function (userObj) {

	// Validation constraints
	var constraints = {

		username: {
			presence: true,
			length: {
		  	minimum: 4,
		    maximum: 14
	  	}
		},

		password: {
		  presence: true,
		  length: {
		    minimum: 4,
		    maximum: 14
		  }
		},

		email: {
		  presence: true,
		  email: true
		}
	};
	return validate(userObj, constraints);
}

/*
* Room Validation
* Fields: title, topic, topic_type, author, lat, lng, radius
*/
Validator.room = function (roomObj) {

	// Validate lat/long as floats
	var testLocation = [roomObj.location.lat, roomObj.location.lng];
	for (var i = 0;  i < 2; i++) {
		if (!parseFloat(testLocation[i])) {
			return 'Invalid lat/lng';
		}
	}

	// Validation constraints
	var constraints = {

		title: {
			presence: true,
			length: {
				minimum: 1,
				maximum: 100
			}
		},

		'topic.content': {
			presence: true,
			length: {
				minimum: 1,
				maximum: 100
			}
		},

		'topic.type': {
			presence: true,
			inclusion: {
				within: {'url': '', 'photo': '', 'location': ''}
			}
		},

		'location.radius': {
			presence: true,
			inclusion: {
				within: {'100': 'block', '800': 'neighborhood', '8000': 'city'}
			}
		}
	};
	return validate(roomObj, constraints);
}

/*
* Comment Validation
* Fields: username, password, email
*/
Validator.comment = function (commentObj) {
	var constraints = {
		content: {
			presence: true,
			length: {
				// maximum: SOME NUMBER,
				minimum: 1
			}
		}
	};
	return validate(commentObj, constraints);
}


module.exports = Validator;
