const express = require('express');
const router = express.Router();
const database = require('../routes/database');
const emitSockets = require('../websocket/socket').emitSockets;
const nodeMailer = require('nodemailer');

const phoneNumber = '0979535659';
const API_KEY = 'F72FD054C190F505B93F09690BA99C5B';
const TITLE = 'KIDSAFE';
const VERSION = 'v0.0.2';
const USER_GMAIL = 'helonesecure@gmail.com';
const PASS_GMAIL = '50BD1167F23A9AD9673FD350B64B21BC';
const SENT_TO_GMAIL = 'thcshiepphuockhkt@gmail.com'; // 'nhomkhkthiepphuoc123@gmail.com';
const MINUTE_LIMIT = 2;

Date.prototype.addHours = function (h) {
  this.setTime(this.getTime() + (h * 60 * 60 * 1000));
  return this;
}

var time = new Date();
const isOkToSendSMS = () => {
  const currentDate = new Date();
  if (currentDate.getTime() - time.getTime() > 60 * 1000 * MINUTE_LIMIT) {
    time = new Date();
    return true;
  } else {
    return false;
  }
}

const extractLocation = (location) => {
  if (location) {
    const t = location.split(',');
    if (t && t.length >= 3) {
      return `${t[1]},${t[2]}`;
    }
  } else {
    return '';
  }
}

const sendSMS = (data) => {
  console.log('SMS_CALL');
  const currentDate = new Date().addHours(7);
  const date = currentDate.getFullYear() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getDate() + " " + currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
  emitSockets('sendSMS', {
    phoneNumber: phoneNumber,
    message: `Xe ${data.vid}. Trường ${data.schoolName}. ${date}. Vị trí : ${extractLocation(data.location)} - https://www.google.com/maps/search/?api=1&query=${extractLocation(data.location)}`
  });
  setTimeout(() => {
    emitSockets('call', { phoneNumber: phoneNumber });
  }, 2000);
}

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
    subject: '[Cảnh báo] Phát hiện còn người trên xe khi xe đã đóng khóa cửa', // Subject line
    text: '', // plain text body
    html: `
      <b>Phát hiện nguy hiểm trên xe có biển số ${data.vid} tại trường ${data.schoolName} vào lúc ${new Date()} </b>
      <br> <p>Vui lòng báo với người có trách nhiệm quản lý gần đó để kiểm tra !</p> <br>
      <br> <br> <p> Vui lòng không phản hồi tin nhắn này vì đây là tin nhắn tự động từ hệ thống SafeKid </p> 
      <br> <p>Vị trí : ${extractLocation(data.location)} </p>
      <br> <p>Click vào link để xem cụ thể vị trí trên bản đồ : https://www.google.com/maps/search/?api=1&query=${extractLocation(data.location)} </p> 
    ` // html body
  };
  // console.log('MAIL: ', data);
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message %s sent: %s', info.messageId, info.response);
  });
}

/*
  TEST :
  http://localhost:7777/upload?vehicleId=v1&schoolId=school_1&apiKey=F72FD054C190F505B93F09690BA99C5B&isHasPerson=1&location=28.6139,77.2090
  https://nhom-khkt-hiep-phuoc.herokuapp.com/upload?vehicleId=v1&schoolId=school_1&apiKey=F72FD054C190F505B93F09690BA99C5B&isHasPerson=1
  https://nhom-khkt-hiep-phuoc.herokuapp.com/upload?apiKey=F72FD054C190F505B93F09690BA99C5B&vehicleId=v1&schoolId=school_1&isHasPerson=1&location=1,10.755894,106.941180
*/
router.get('/upload', (req, res, next) => {
  var vehicleId = req.query.vehicleId || '';
  var schoolId = req.query.schoolId || '';
  var apiKey = req.query.apiKey || '';
  var isHasPerson = (req.query.isHasPerson) ? 'true' : 'false' || '';
  var location = req.query.location || '';

  console.log(req.query);

  if (!(apiKey && vehicleId && schoolId)) {
    res.json({ status: 0, error: { message: 'apiKey or vehicleId or schoolId is missing!' } });
  } else if (apiKey !== API_KEY) {
    res.json({ status: 0, error: { message: 'apiKey is wrong!' } });
  } else {
    //vehicles/${vehicleId}/statuses
    database.ref(`/${schoolId}`).once('value').then(function (snapshot) {
      const schoolInfo = snapshot.val();
      if (schoolInfo) {
        try {
          const statuses = schoolInfo.vehicles[vehicleId].statuses;
          const vid = schoolInfo.vehicles[vehicleId].vid;
          const schoolName = schoolInfo.name;
          const t = Object.keys(statuses).length;
          const data = {};
          data['s' + (t + 1)] = {
            date: new Date(),
            isHasPerson: isHasPerson
          };
          database.ref(`/${schoolId}/vehicles/${vehicleId}/statuses`).update(data);
          const _data = {
            vehicleId: vehicleId,
            schoolId: schoolId,
            isHasPerson: isHasPerson,
            vid: vid,
            schoolName: schoolName,
            date: new Date(),
            location: location,
          };
          emitSockets('alert', { vehicleId: vid, schoolId: schoolName, isHasPerson: isHasPerson, data: _data });
          if (isHasPerson === 'true') {
            console.log(new Date(), extractLocation(_data.location));
            if (isOkToSendSMS()) {
              sendMail(_data);
              sendSMS(_data);
            }
          }
          res.json({ status: 1, message: 'ok!' });
        }
        catch {
          res.json({ status: 0, error: { message: 'vehicleId or schoolId is wrong!' } });
        }
      } else {
        res.json({ status: 0, error: { message: 'vehicleId or schoolId is wrong!' } });
      }
    });

  }

});


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

module.exports = router;
