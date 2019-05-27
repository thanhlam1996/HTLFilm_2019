var express = require("express");
var router = express.Router();
var AWS = require("aws-sdk");
var nodemailer = require('nodemailer');
var fs = require("fs")


AWS.config.update({
  region: "us-east-1",
  endpoint: "dynamodb.us-east-1.amazonaws.com"
});
AWS.config.accessKeyId = "AKIA6MYIYF6FXYX64G7Y";
AWS.config.secretAccessKey = "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";

var docClient = new AWS.DynamoDB.DocumentClient();

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'lozodo831@gmail.com',//youremail@gmail.com
    pass: '717411love'
  }
});//https://myaccount.google.com/lesssecureapps

router.post('/sendmail', (req, res, next) => {
  var mailOptions = {
    from: 'lozodo831@gmail.com',
    to: 'lam.truong1996@gmail.com',
    subject: 'HTLFilm Xin Chào',
    html: fs.readFileSync('./emails/mail.html')
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
})

router.get('/check-email-subscribe', function (req, res, next) {
  var email =req.query.email;
  var params = {
    TableName: "Notification",
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: {
      ":id": 'subscribe'
    }
  };

  docClient.query(params, function (err, data) {
    if (err) {
      console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      var isEmail=false;
      data.Items[0].emails.forEach((i) => {
        if(email==i)
        {
          isEmail=!isEmail
        }
      });
      return res.send(isEmail);
    }
  })
})

router.post("/add-subscribe-email", function(req,res,next){
  var email=req.body.email;
  var params = {
    TableName: "Notification",
    Key: {
      id: 'subscribe'
    },
    UpdateExpression:"set emails=list_append(emails,:a)",
    ExpressionAttributeValues: {
      ":a": [email],
    },
    ReturnValues: "UPDATED_NEW"
  };
  docClient.update(params, function (err, data1) {
    if (err) {
      console.error(
        "Unable to update item. Error JSON:",
        JSON.stringify(err, null, 2)
       
      );
      return res.send(false);
    } else {
      MailSubscribed(email)
      return res.send(true);
    }
  })
})
function MailSubscribed(email) {
  var mailOptions = {
    from: 'lozodo831@gmail.com',
    to: email,
    subject: 'HTLFilm Xin Chào',
    html: fs.readFileSync('./emails/mail.html')
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
      return true;
    }
  });
}


module.exports = router;