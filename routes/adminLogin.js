var express = require("express");
var router = express.Router();
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'allforyou.bamboo@gmail.com',
    pass: 'ttcnpmnhom20'
  }
});

router.get('/', function (req, res) {
  res.redirect('admin/login');
});
router.get('/login', function (req, res) {
  res.render('admin/login');
});
router.get('/dashboard', function (req, res) {
  res.render('admin/dashboard');
});

router.post('/send', function (req, res) {

  var mailOptions = {
    from: 'allforyou.bamboo@gmail.com',
    to: req.body.listemail,
    subject: req.body.subject,
    text: req.body.message,
    replyTo: 'allforyou.bamboo@gmail.com'
  }
  // console.log(mailOptions);
  // console.log(req.body.listemail);

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      res.json({ status: "ERROR" });
    } else {
      res.json({ status: "OK" });

    }
  });

});



module.exports = router;

