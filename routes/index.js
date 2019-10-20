const express = require('express');
const router = express.Router();
const database = require('../routes/database');
const emitSockets = require('../websocket/socket').emitSockets;
const nodeMailer = require('nodemailer');

const API_KEY = 'F72FD054C190F505B93F09690BA99C5B';
const TITLE = 'KIDSAFE';
const VERSION = 'v0.0.2';
const USER_GMAIL = 'helonesecure@gmail.com';
const PASS_GMAIL = '50BD1167F23A9AD9673FD350B64B21BC';
const SENT_TO_GMAIL = 'nhomkhkthiepphuoc123@gmail.com';

const sendMail = (data) => {
  let transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: USER_GMAIL,
      pass: PASS_GMAIL
    }
  });
  let mailOptions = {
    from: '"SafeKid system" <helonesecure@gmail.com>', // sender address
    to: SENT_TO_GMAIL, // list of receivers
    subject: '[Alert] auto-alert from SafeKid system', // Subject line
    text: '', // plain text body
    html: `
      <b>Detect danger in vehicle ${data.vehicleId} in school ${data.schoolId} at ${new Date()} </b>
      <p>Please don't reply!</p>
    ` // html body
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message %s sent: %s', info.messageId, info.response);
  });
}

router.get('/', (req, res, next) => {
  database.ref('/').once('value').then(function (snapshot) {
    const value = snapshot.val();
    const totalSchools = Object.keys(value).length;
    const totalVehicles = Object.keys(value).map(key => Object.keys(value[key].vehicles).length).reduce((a, b) => a + b, 0);
    const vehicles = [].concat(...Object.keys(value).map(key => {
      const vehicles = value[key].vehicles;
      return Object.keys(vehicles).map(subKey => ({
        ...vehicles[subKey],
        schoolName: value[key].name,
        noData: Object.keys(vehicles[subKey].statuses).length,
        vstateClass: vehicles[subKey].vstate === 'Active' ? 'complete' : 'pending'
      }));
    }));
    const statuses = [].concat(...vehicles.map(vehicle => {
      const statuses = vehicle.statuses;
      return Object.keys(statuses).map(subKey => ({
        ...statuses[subKey],
        schoolName: vehicle.schoolName,
        vehicleId: vehicle.vid,
        statusName: statuses[subKey].isHasPerson === 'true' ? 'Danger!' : ''
      }));
    }));
    res.render('home', { totalSchools: totalSchools, totalVehicles: totalVehicles, vehicles: vehicles, statuses: statuses });
  });
});

router.get('/home', async (req, res, next) => {
  database.ref('/').once('value').then(function (snapshot) {
    const value = snapshot.val();
    const totalSchools = Object.keys(value).length;
    const totalVehicles = Object.keys(value).map(key => Object.keys(value[key].vehicles).length).reduce((a, b) => a + b, 0);
    const vehicles = [].concat(...Object.keys(value).map(key => {
      const vehicles = value[key].vehicles;
      return Object.keys(vehicles).map(subKey => ({
        ...vehicles[subKey],
        schoolName: value[key].name,
        noData: Object.keys(vehicles[subKey].statuses).length,
        vstateClass: vehicles[subKey].vstate === 'Active' ? 'complete' : 'pending'
      }));
    }));
    const statuses = [].concat(...vehicles.map(vehicle => {
      const statuses = vehicle.statuses;
      return Object.keys(statuses).map(subKey => ({
        ...statuses[subKey],
        schoolName: vehicle.schoolName,
        vehicleId: vehicle.vid,
        statusName: statuses[subKey].isHasPerson === 'true' ? 'Danger!' : ''
      }));
    }));
    res.render('home', { totalSchools: totalSchools, totalVehicles: totalVehicles, vehicles: vehicles, statuses: statuses });
  });
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

router.get('/school', (req, res, next) => {
  res.render('school', {});
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
        const _data = { vehicleId: vehicleId, schoolId: schoolId, isHasPerson: isHasPerson, date: new Date() };
        emitSockets('alert', { vehicleId: vehicleId, schoolId: schoolId, isHasPerson: isHasPerson, data: _data });
        if (isHasPerson === 'true') {
          sendMail(_data);
        }
        res.json({ status: 1, message: 'ok!' });
      } else {
        res.json({ status: 0, error: { message: 'vehicleId or schoolId is wrong!' } });
      }
    });

  }

});

module.exports = router;
