var express = require("express");
var router = express.Router();
var AWS = require("aws-sdk");
var uuid4 = require("uuid4");
var dateFormat = require("dateformat");
var dynamoDbConfig = require("../config/dynamodb-config");
// =========================Role===========================
// Movie
// 1=>Da duyet
// 2=>Chua duyet
// 3=>Da duoc dang ky
// 4=>Cho dang ky
// 5=>Het han dang ky
// ============
// Account
// Admin=>4
// SubAdmin=>3
// Member=>2
// User=>1

// =====================End role===========================

// var urlencodedParser = bodyParser.urlencoded({ extended: false })

AWS.config.update({
  region: "us-east-1",
  endpoint: "dynamodb.us-east-1.amazonaws.com"
});
AWS.config.accessKeyId = "AKIA6MYIYF6FXYX64G7Y";
AWS.config.secretAccessKey = "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";

var docClient = new AWS.DynamoDB.DocumentClient();
//
// =====function create and check uuid4===========
//Khi mot uuid dc tao ra no se kiem tra xem tai csdl co ton tai cai id nay chua neu co thi lay cai khac va tiep tuc check

// ========= Get writing movie=====
router.get("/getwriting", function(req, res, next) {
  // var _title = req.body.title;
  // var _id = req.query.id;
  // var params = {
  //     TableName: "Movies",
  //     KeyConditionExpression: "id=:id",
  //     ExpressionAttributeValues: {
  //         ":id": _id
  //     }
  // };
  // docClient.query(params, function (err, data) {
  //     if (err) {
  //         console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
  //     }
  //     else {
  //         if(data.Count>0)
  //         {
  //            return res.render("../views/movies/writingmovie.ejs",{title:"Viết bài", data})
  //         }
  //     }
  // });
  res.render("../views/writing/writing.ejs", { title: "Viết bài" });
});
module.exports = router;
