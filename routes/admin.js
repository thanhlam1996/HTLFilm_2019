var express = require("express");
var router = express.Router();
var AWS = require("aws-sdk");
var passport = require("passport");
var dynamoDbConfig = require("../config/dynamodb-config");

// var urlencodedParser = bodyParser.urlencoded({ extended: false })

AWS.config.update({
  region: "us-east-1",
  endpoint: "dynamodb.us-east-1.amazonaws.com"
});
AWS.config.accessKeyId = "AKIA6MYIYF6FXYX64G7Y";
AWS.config.secretAccessKey = "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";

var docClient = new AWS.DynamoDB.DocumentClient();
function CheckLogin(role, res, req) {
  if (!req.session.passport) {
    return false;
  } else {
    if (req.session.passport.user.role < role) {
      return res.redirect('/error-not-role');
    } else {
      return true;
    }
  }
}
// ====================== Phần này dành riêng cho trang quản lý thuộc về role của account >2=========
router.get("/pageadmin", function(req, res, next) {
  // if (req.isAuthenticated()) {
  //   return res.render("../views/err-role/err.ejs", {
  //     roleerr: "Bạn đăng nhập để truy cập đến trang này!"
  //   });
    // return res.send(false);
  // } else {
   
  //   if (req.session.passport.user.role < 1) {
  //     return res.render("../views/err-role/err.ejs", {
  //       roleerr: "Bạn cần được cấp quyền để truy cập đến trang này!"
  //     });
  //   } else {
  //     return res.render("../views/admin/pageadmin.ejs");
  //   }
    // return res.send(sess);
  // }
});

module.exports = router;
