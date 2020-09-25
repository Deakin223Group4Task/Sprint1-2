const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service:'Gmail',
    auth: {
        user: 'sit223.group4@gmail.com',
        pass: 'zxc123!@'
    }
  });
transporter.verify(function(error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

    exports.send = function(mailOptions) {
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });
  }