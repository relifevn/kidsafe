const express = require('express');
const router = express.Router();
const database = require('../routes/database');
const emitSockets = require('../websocket/socket').emitSockets;

const API_KEY = 'F72FD054C190F505B93F09690BA99C5B';
const TITLE = 'KIDSAFE';
const VERSION = 'v0.0.2';

router.get('/', (req, res, next) => {
  res.render('index', { title: TITLE, version: VERSION });
});

router.get('/home', (req, res, next) => {
  res.render('home', {});
});

router.get('/index', (req, res, next) => {
  res.render('index', {});
});

router.get('/charts-chartjs', (req, res, next) => {
  res.render('charts-chartjs', {});
});

router.get('/charts-flot', (req, res, next) => {
  res.render('charts-flot', {});
});

router.get('/charts-peity', (req, res, next) => {
  res.render('charts-peity', {});
});

router.get('/font-fontawesome', (req, res, next) => {
  res.render('font-fontawesome', {});
});

router.get('/font-themify', (req, res, next) => {
  res.render('font-themify', {});
});

router.get('/forms-advanced', (req, res, next) => {
  res.render('forms-advanced', {});
});

router.get('/forms-basic', (req, res, next) => {
  res.render('forms-basic', {});
});

router.get('/maps-gmap', (req, res, next) => {
  res.render('maps-gmap', {});
});

router.get('/maps-vector', (req, res, next) => {
  res.render('maps-vector', {});
});

router.get('/page-login', (req, res, next) => {
  res.render('page-login', {});
});

router.get('/page-register', (req, res, next) => {
  res.render('page-register', {});
});

router.get('/pages-forget', (req, res, next) => {
  res.render('pages-forget', {});
});
router.get('/tables-basic', (req, res, next) => {
  res.render('tables-basic', {});
});

router.get('/tables-data', (req, res, next) => {
  res.render('tables-data', {});
});

router.get('/ui-alerts', (req, res, next) => {
  res.render('ui-alerts', {});
});

router.get('/ui-badges', (req, res, next) => {
  res.render('ui-badges', {});
});

router.get('/ui-buttons', (req, res, next) => {
  res.render('ui-buttons', {});
});

router.get('/ui-cards', (req, res, next) => {
  res.render('ui-cards', {});
});

router.get('/ui-grids', (req, res, next) => {
  res.render('ui-grids', {});
});

router.get('/ui-modals', (req, res, next) => {
  res.render('ui-modals', {});
});

router.get('/ui-progressbar', (req, res, next) => {
  res.render('ui-progressbar', {});
});

router.get('/ui-switches', (req, res, next) => {
  res.render('ui-switches', {});
});

router.get('/ui-tabs', (req, res, next) => {
  res.render('ui-tabs', {});
});

router.get('/ui-typgraphy', (req, res, next) => {
  res.render('ui-typgraphy', {});
});

router.get('/widgets', (req, res, next) => {
  res.render('widgets', {});
});

router.get('/upload', (req, res, next) => {
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
        emitSockets('alert', { vehicleId: vehicleId, schoolId: schoolId, isHasPerson: isHasPerson, data: data });
        res.json({ status: 1, message: 'ok!' });
      } else {
        res.json({ status: 0, error: { message: 'vehicleId or schoolId is wrong!' } });
      }
    });

  }

});

module.exports = router;
