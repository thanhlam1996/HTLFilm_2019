var express = require("express");
var router = express.Router();
var AWS = require("aws-sdk");
var dateFormat = require("dateformat");
// var passport = require("passport");
var dynamoDbConfig = require("../config/dynamodb-config");
var moment = require('moment');
var arraySort = require('array-sort');//Phuong thuc dung de sap xep nhuwng chuaw kha thi hihi
var descending = require('sort-desc');//Phuong thuc sorf theo thu tu gia, dan
var fs = require("fs");


// var urlencodedParser = bodyParser.urlencoded({ extended: false })

AWS.config.update({
  region: "us-east-1",
  endpoint: "dynamodb.us-east-1.amazonaws.com"
});
AWS.config.accessKeyId = "AKIA6MYIYF6FXYX64G7Y";
AWS.config.secretAccessKey = "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";

var docClient = new AWS.DynamoDB.DocumentClient();

// ======================Check Login=============================
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


// ======================End Check Login=========================

/* GET home page. */
// <<<<<<< Updated upstream
router.get("/", function (req, res, next) {


  var params = {
    TableName: "Movies",
    FilterExpression: "#stt=:stt",
    ExpressionAttributeNames: {
      "#stt": "stt"

    },
    ExpressionAttributeValues: {
      ":stt": 1

    }
  };

  docClient.scan(params, function (err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      // ==========Xử lý js trả về index=============

      var now = new Date();
      var nowdate = dateFormat(now, "isoDate");
      var movietop = [];
      var movienew = [];
      var movieplaying = [];//Phim dang chieu duoc tinhs dua tren ngay phat hanh phai nho hon ngay hien tai trong khoang 30 ngay
      var moviecoming = [];
      data.Items.forEach((i) => {
        if (i.countlike && i.ratings) {
          movietop.push(i)
        }
        movienew.push(i);
        if (Math.ceil(Math.abs(new Date(i.info.publicationdate) - new Date(nowdate)) / (1000 * 3600 * 24)) <= 30 && Math.ceil(Math.abs(new Date(i.info.publicationdate) - new Date(nowdate)) / (1000 * 3600 * 24)) >= 0) {
          movieplaying.push(i);
        }
        if (new Date(i.info.publicationdate) > new Date(nowdate)) {
          moviecoming.push(i);
        }

      })
      movietop.sort((a, b) => {
        var ar = 0;
        var br = 0;
        a.ratings.forEach((m) => {
          ar += m;
        })
        b.ratings.forEach((n) => {
          br += n;
        })
        return (b.countlike + (br / b.ratings.length) + b.movieview) - (a.countlike + (ar / a.ratings.length) + a.movieview);
      })
      movienew.sort((a, b) => {
        return new Date(b.info.publicationdate) - new Date(a.info.publicationdate);
      })
      movieplaying.sort((a, b) => {
        return new Date(b.info.publicationdate) - new Date(a.info.publicationdate);
      })
      var titletab="HTLFilm-Phim Mới Mỗi Ngày";
      res.render("main/index", { movietop, movienew, moviecoming, movieplaying,titletab });
    }
  });
});
// =======

// ===========Search============
router.post("/search-movie", function (req, res, next) {
  var title = req.body.txtsearch;
  var params = {
    TableName: "Movies",
    ProjectionExpression:"#title,id,info.posterimage",
    FilterExpression: "(contains(#title,:title) OR contains(#typemovie,:title) OR begins_with(#title,:title) OR begins_with(#typemovie,:title))  AND (#stt=:stt)",
    ExpressionAttributeNames: {
      "#stt": "stt",
      "#title": "title",
      "#typemovie": "typemovie",
    },
    ExpressionAttributeValues: {
      ":title": title,
      ":stt": 1
    }
  };
  var data=[];
  docClient.scan(params, onScan);

function onScan(err, result) {
    if (err) {
        console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      result.Items.forEach(function(movie) {
          //  console.log(movie.title);
          data.push(movie);
        });
        if (typeof result.LastEvaluatedKey != "undefined") {
            // console.log("Scanning for more...========================================================================================================================");
            params.ExclusiveStartKey = result.LastEvaluatedKey;
            docClient.scan(params, onScan);
        }else
        {
          var titletab="HTLFilm-Phim Mới Mỗi Ngày";
          return res.render("../views/movies/result-search-movie.ejs", { txtsearch: title, data,titletab});          
        }
    }
  }
});
// ==========End Search============

router.post('/cloud-search', function (req, res, next) {

  // var csDomain = 'arn:aws:cloudsearch:us-west-2:546033418272:domain/imdb-product'; 
  var csDomain = 'search-search-yyqw43ehsvvj6ykfellnhmdd5u.us-east-1.cloudsearch.amazonaws.com';
  var cloudsearch = new AWS.CloudSearchDomain({ endpoint: csDomain, apiVersion: '2013-01-01' });
  var csParams = {
    query: req.body.txtsearch, /* required */
    cursor: String.params,
    expr: String.params,
    facet: String.params,
    filterQuery: String.params,
    highlight: String.params,
    partial: true || false,
    queryOptions: String.params,
    queryParser: 'simple',
    return: String.params,
    size: 100,
    sort: String.params,
    start: 0,
    stats: String.params
  };

  cloudsearch.search(csParams, function (err, data) {

    if (err) {
      console.log(err); // an error occurred
    } else {
      var titletab="HTLFilm-Phim Mới Mỗi Ngày";
      return res.render("../views/movies/result-search-movie.ejs", { txtsearch: req.body.txtsearch, data,titletab});
      // console.log(JSON.stringify(data))
    }
  });
});
//================ Paging
// router.post("/paging-search", function (req, res, next) {
//   var title = req.body.title;
//   var params = {
//     TableName: "Movies",
//     ProjectionExpression:"#title,id,info.posterimage",
//     FilterExpression: "(contains(#title,:title) OR contains(#typemovie,:title) OR begins_with(#title,:title) OR begins_with(#typemovie,:title))  AND (#stt=:stt)",
//     ExpressionAttributeNames: {
//       "#stt": "stt",
//       "#title": "title",
//       "#typemovie": "typemovie",
//     },
//     ExpressionAttributeValues: {
//       ":title": title,
//       ":stt": 1
//     }
//   };
//   var data=[];
//   docClient.scan(params, onScan);

// function onScan(err, result) {
//     if (err) {
//         console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
//     } else {
//       result.Items.forEach(function(movie) {
//           //  console.log(movie.title);
//           data.push(movie);
//         });
//         if (typeof result.LastEvaluatedKey != "undefined") {
//             // console.log("Scanning for more...========================================================================================================================");
//             params.ExclusiveStartKey = result.LastEvaluatedKey;
//             docClient.scan(params, onScan);
//         }else
//         {
//           return res.send(data)      
//         }
//     }
//   }
// });
// ==========End Search============
router.get("/getall", function (req, res, next) {
  var params = {
    TableName: "Movies",
    ProjectionExpression: "title",
    // FilterExpression: "#yr between :start_yr and :end_yr",
    // ExpressionAttributeNames: {
    //     "#yr": "year",
    // },
    // ExpressionAttributeValues: {
    //      ":start_yr": 1950,
    //      ":end_yr": 1959 
    // }
    
};
var result=[];
console.log("Scanning Movies table.");
docClient.scan(params, onScan);

function onScan(err, data) {
    if (err) {
        console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        data.Items.forEach(function(movie) {
          //  console.log(movie.title);
           result.push(movie);
        });
        if (typeof data.LastEvaluatedKey != "undefined") {
            // console.log("Scanning for more...========================================================================================================================");
            params.ExclusiveStartKey = data.LastEvaluatedKey;
            docClient.scan(params, onScan);
        }else
        {
          return res.render("../views/movies/result-search-movie.ejs", { txtsearch: "hi", result,titletab:"search" });
          // var count=0;
          // result.forEach((i)=>{
          //   console.log(i.title)
          //   count++;
          // })
          // console.log("==============================="+count+"============================")
          
        }
    }
  }
});

// =====GET LOGIN==========
router.get("/login-register", function (req, res, next) {
  var titletab="HTLFilm-Phim Mới Mỗi Ngày";
  return res.render("../views/account/login-register-account.ejs",{titletab});
});
// =====END GET LOGIN======
// ========Get Session=============

router.get("/getsession", function (req, res, next) {
  if (req.isAuthenticated()) {
    return res.send(false);
  } else {
    var sess = {
      role: req.session.passport.user.role,
      fullname: req.session.passport.user.fullname,
      id: req.session.passport.user.id,
      email: req.session.passport.user.email
    };
    return res.send(sess);
  }
});

// =======================================================
router.get("/file", function(req,res,next){
var allcar = JSON.parse(fs.readFileSync("./data/movies.json", "utf-8"));
var a=[];
allcar.forEach(function(m) {
 var params = {   
        type : "add",
        id : m.id,
        fields : { 
            title:m.title,
            actor:m.info.actor,
            country:m.info.country,
            producer:m.info.producer,
            posterimage:m.info.posterimage
        }
  };
 a.push(params);
});
fs.writeFile("cloud.txt",JSON.stringify(a), "UTF-8")

})
// =============Update View movie=====================
function AddViewMovie(id) {
  var params = {
    TableName: "Movies",
    Key: {
      id: id
    },
    UpdateExpression:
      "set movieview=movieview+:cnt",

    ExpressionAttributeValues: {
      ":cnt": 1
    },
    ReturnValues: "UPDATED_NEW"
  };
  docClient.update(params, function (err, data) {
    if (err) {
      console.error(
        "Unable to update item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      // console.log(JSON.stringify(data));
      return true;
    }
  });
}
function CreateViewMovie(id) {
  var params = {
    TableName: "Movies",
    Key: {
      id: id
    },
    UpdateExpression:
      "set movieview=:cnt",

    ExpressionAttributeValues: {
      ":cnt": 1
    },
    ReturnValues: "UPDATED_NEW"
  };
  docClient.update(params, function (err, data) {
    if (err) {
      console.error(
        "Unable to update item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      // console.log(JSON.stringify(data));
      return true;
    }
  });
}
// =============End Update View Movie=================
// ========GET MOVIE======
router.get("/detail-movie", function (req, res, next) {
  // var _title = req.body.title;
  
  var _id = req.query.id;
  var id = 'no';
  var role = 'no';
  if (req.session.passport) {
    id = req.session.passport.user.id;
    role = req.session.passport.user.role;
  }
  var _role = req.query.role;
  var params = {
    TableName: "Movies",
    KeyConditionExpression: "id=:id",
    ExpressionAttributeValues: {
      ":id": _id
    }
  };
  docClient.query(params, function (err, data) {
    if (err) {
      console.error(
        "Unable to read item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      console.log(JSON.stringify(data))
      var titletab="HTLFilm-Phim ";
      var isview = false;
      data.Items.forEach((j) => {
        if (j.movieview) {
          isview = true;
          titletab+=j.title;
        }
      })
      if (isview == true) {
        AddViewMovie(_id);
      }
      else {
        CreateViewMovie(_id);
      }
      if (_role == "ad") {
        return res.render("../views/movies/movie-detail.ejs", {
          data,
          role: "ad",
          moment: moment,
          descending: descending,
          id_owner: id,
          role_owner: role,
          titletab
        });
      } else if (_role == "mb") {
        return res.render("../views/movies/movie-detail.ejs", {
          data,
          role: "mb",
          moment: moment,
          descending: descending,
          id_owner: id,
          role_owner: role,
          titletab
        });
      } else {
        console.log(JSON.stringify(data))
        return res.render("../views/movies/movie-detail.ejs", {
          data,
          role: "none",
          moment: moment,
          descending: descending,
          id_owner: id,
          role_owner: role,
          titletab
        });
      }
    }
  });
});
// ========End GET MOVIE==

// ====================== Phần này dành riêng cho trang quản lý thuộc về role của account >2=========
router.get("/pageadmin", function (req, res, next) {
  if(CheckLogin(2,res,req)){
    if (req.session.passport.user.role == 2) {
   
      return res.redirect("/movie/get-list-writed-member");
    }
    else {  
      
      return res.redirect("/movie/get-list-movie-admin");
    }
  }
  else
  {
    return res.redirect('/error-not-login'); //ERR 500
  }
});
// =============GET DETAIL ACC ALL OBJECT================
router.get("/get-detail-account", function (req, res, next) {
  if (CheckLogin(1, res, req)) {
    var _id = req.session.passport.user.id;
    var params = {
      TableName: "Accounts",
      KeyConditionExpression: "id=:id",
      ExpressionAttributeValues: {
        ":id": _id
      }
    };
    docClient.query(params, function (err, data) {
      if (err) {
        console.error(
          "Unable to read item. Error JSON:",
          JSON.stringify(err, null, 2)
        );
      } else {
        var titletab="HTLFilm-Thông Tin Tài Khoản";
        var ck = _id.substring(0, 2);;
        if (ck == "GG" || ck == "FB") {
          return res.render("../views/account/detail-acc-owner.ejs", { data, ck: "no", moment: moment,titletab });
        }
        else {
          return res.render("../views/account/detail-acc-owner.ejs", { data, ck: "yes", moment: moment,titletab });
        }
      }
    });
  } else {
    return res.redirect('/error-not-login'); //ERR 500
  }
});
// ===========================================
// ==============UPDATE ACCOUNT===============
router.get("/get-update-account", function (req, res, next) {
  var titletab="HTLFilm-Cập Nhật Thông Tin Tài Khoản";
  if (CheckLogin(1, res, req)) {
    var _id = req.session.passport.user.id;
    var params = {
      TableName: "Accounts",
      KeyConditionExpression: "id=:id",
      ExpressionAttributeValues: {
        ":id": _id
      }
    };
    docClient.query(params, function (err, data) {
      if (err) {
        console.error(
          "Unable to read item. Error JSON:",
          JSON.stringify(err, null, 2)
        );
      } else {
        return res.render("../views/account/update-account.ejs", { data,titletab })
      }
    });
  } else {
    return res.redirect('/error-not-login'); //ERR 500
  }
})
// ===========================================



// ######################### ERROR FOR ALL PAGE #################################

// ---------ERR Not Login----------
router.get("/error-not-login",(req,res,next)=>{
  var titletab="HTLFilm-Lỗi Xác Thực";
  return res.render('../views/error/err-not-login.ejs',{titletab});
})
// --------END Not Login-----------

// ---------ERR Not Role----------
router.get("/error-not-role",(req,res,next)=>{
var titletab="HTLFilm-Lỗi Truy Cập";
  return res.render('../views/error/err-not-role.ejs',{titletab});
})
// --------END Not Role-----------

// ####################### END ERROR FOR ALL PAGE ###############################


// ---------- Contact-----------
router.get('/contact',(req,res,next)=>{
  var titletab="HTLFilm-Team";
  return res.render('../views/main/contact.ejs',{titletab});
})
// --------End Contact----------




//============Send Mail=============

module.exports = router;
