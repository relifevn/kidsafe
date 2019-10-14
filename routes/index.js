var express = require('express');
var router = express.Router();
var database = require('../routes/database');

const API_KEY = 'F72FD054C190F505B93F09690BA99C5B';
const TITLE = 'KIDSAFE';
const VERSION = 'v0.0.2';

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index', { title: TITLE, version: VERSION }); // index.hbs file is rendered
});

router.get('/upload', function (req, res, next) {
	var vehicleId = req.query.vehicleId || '';
	var schoolId = req.query.schoolId || '';
	var apiKey = req.query.apiKey || '';
	var isHasPerson = req.query.isHasPerson || '';

	console.log(req.query);

	if (!(apiKey && vehicleId && schoolId)) {
		res.json({ status: 0, error: { message: 'apiKey or vehicleId or schoolId is missing!' } });
	} else if (apiKey !== API_KEY) {
		res.json({ status: 0, error: { message: 'apiKey is wrong!' } });
	} else {
		database.ref(`/${schoolId}/vehicles/${vehicleId}/statuses`).once('value').then(function (snapshot) {
			var result = snapshot.val();
			if (result) {
				const t = Object.keys(result).length;
				const data = {};
				data['s' + (t + 1)] = {
					date: new Date(),
					isHasPerson: isHasPerson
				};
				database.ref(`/${schoolId}/vehicles/${vehicleId}/statuses`).update(data);
				res.json({ status: 1, message: 'ok!' });
			} else {
				res.json({ status: 0, error: { message: 'vehicleId or schoolId is wrong!' } });
			}
		});

	}

});

module.exports = router;
