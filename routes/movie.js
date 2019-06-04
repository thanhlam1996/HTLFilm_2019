var express = require("express");
var router = express.Router();
var AWS = require("aws-sdk");
var uuid4 = require("uuid4");
var dateFormat = require("dateformat");
var multer = require("multer");
var multerS3 = require("multer-s3");
var upload = multer({ dest: "uploads/" });

var deleteS3 = require('s3fs');
var moment = require('moment');

var fs = require("fs")
var nodemailer = require('nodemailer');

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

// ==============================function check login====================================
function CheckLogin(role, res, req) {
  if (!req.session.passport) {
    return false;
  } else {
    var rol=req.session.passport.user.role?req.session.passport.user.role:req.session.passport.user.Items[0].role;
    if (rol<role) {
      return res.redirect('/error-not-role');
    } else {
      return true;
    }
  }
}

// ======================================================================================
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'lozodo831@gmail.com',//youremail@gmail.com
    pass: '717411love'
  }
});//https://myaccount.google.com/lesssecureapps


// =====function create and check uuid4===========
//Khi mot uuid dc tao ra no se kiem tra xem tai csdl co ton tai cai id nay chua neu co thi lay cai khac va tiep tuc check
function createID() {
  var id = uuid4();
  while (checkidmovie(id) == true) {
    id = uuid4();
  }
  return id;
}

//Function check id tu database
function checkidmovie(id) {
  var params = {
    TableName: "Movies",
    KeyConditionExpression: "#id =:id",
    ExpressionAttributeNames: {
      "#id": "id"
    },
    ExpressionAttributeValues: {
      ":id": id
    }
  };
  docClient.query(params, function (err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      if (data.Count > 0) {
        return false;
      } else {
        return true;
      }
    }
  });
}
// ========Create============= role=3
router.get("/create-movie", function (req, res, next) {
  var titletab = "Create Movie";
  if (CheckLogin(3, res, req)) {
    return res.render("movies/createMovie-admin.ejs", { moment: moment, titletab });
  } else {
    return res.redirect('/error-not-login'); //ERR 500;
  };
});

// ================Multer==============
var imgname = ""; //Bien khai bao static chua ten anh bia


var s3 = new AWS.S3();

var s3Options = {
  region: "us-east-1",
  accessKeyId: "AKIA6MYIYF6FXYX64G7Y",
  secretAccessKey: "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"
};
s3.config.endpoint = "s3.us-east-1.amazonaws.com";

var s3upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "movies-bucket-admin",
    key: function (req, file, cb) {
      var fileName = file.fieldname + "-" + Date.now() + file.originalname;
      imgname = "https://s3.amazonaws.com/movies-bucket-admin/" + fileName;
      cb(null, fileName);
    }
  })
});

// ====================Hàm Xóa hình ảnh từ S3==============================


var s3Fs = new deleteS3('movies-bucket-admin', s3Options);


// ========================================================================

//=========================================================================
// ========================================================================
//=========================================================================
//***************** Phần multer này dùng dể test local vs folder save là updates============
// ================Multer==============
//Bien khai bao static chua ten anh bia
// var storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/images/uploads')
//   },
//   filename: (req, file, cb) => {
//     var fileName = file.fieldname + "-" + Date.now() + file.originalname;
//     imgname = fileName;
//     cb(null, fileName)
//   }
// });
// var upload = multer({ storage: storage });
// ====================================
//*****************************************************************************************/
// =========================================================================
//==========================================================================
// =========================================================================




router.get('/in', function (req, res, next) {
  var s = ""
  s += fs.readFileSync('./emails/headermail.html');
  console.log(s);

})

// ====================================role=3
router.post("/create-movie-admin", function (req, res, next) {
  if (CheckLogin(3, res, req)) {
    if (req.body.title instanceof Array) {
      for (var i = 0; i < req.body.title.length; i++) {
        var id = createID();
        var note = "no";
        if (req.body.note[i]) {
          note += req.body.note[i]
        }
        var fullname=req.session.passport.user.fullname?req.session.passport.user.fullname:req.session.passport.user.Items[0].info.fullname
        var email=req.session.passport.user.email?req.session.passport.user.email:req.session.passport.user.Items[0].info.email
        var now = new Date();
        var initdate = dateFormat(now, "isoDate");
        var params = {
          TableName: "Movies",
          Item: {
            id: id,
            title: req.body.title[i],
            process: {
              create: {
                "creater": [fullname, email],
                "initdate": initdate,
                "deadline": req.body.deadline[i],
                "createnote": note
              }
            },
            info: {
              "producer": req.body.producer[i]
            },
            stt: 4
          }
        };
        docClient.put(params, function (err, data) {
          if (err) {
            console.error(
              "Unable to update item. Error JSON:",
              JSON.stringify(err, null, 2)
            );
          } else {
          }
        });
        // console.log(JSON.stringify(params))
      }
      return res.redirect("/movie/list-movie-waiting-register-write");
    } else {
      var id = createID();
      var note = "no";
      if (req.body.note) {
        note = req.body.note
      }
      var now = new Date();
      var initdate = dateFormat(now, "isoDate");
      var _fullname=req.session.passport.user.fullname?req.session.passport.user.fullname:req.session.passport.user.Items[0].info.fullname
      var _email=req.session.passport.user.email?req.session.passport.user.email:req.session.passport.user.Items[0].info.email
      var params = {
        TableName: "Movies",
        Item: {
          id: id,
          title: req.body.title,
          process: {
            create: {
              "creater": [_fullname, _email],
              "initdate": initdate,
              "deadline": req.body.deadline,
              "createnote": note
            }
          },
          info: {
            "producer": req.body.producer
          },
          stt: 4
        }
      };

      docClient.put(params, function (err, data) {
        if (err) {
          console.error(
            "Unable to update item. Error JSON:",
            JSON.stringify(err, null, 2)
          );
        } else {
          return res.redirect("/movie/list-movie-waiting-register-write");
        }
      });
    }
  } else {
    return res.redirect('/error-not-login'); //ERR 500
  }
});
// =========Update Movie Admin================== role=2
router.get("/update-movie-admin", function (req, res, next) {
  if (CheckLogin(2, res, req)) {
    var _id = req.query.id;
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
        if (data.Count > 0) {
          var titletab = "Update Movie";
          return res.render("../views/movies/admin-update-movie.ejs", { data, moment: moment, titletab });
        }
      }
    });
  } else {
    return res.redirect('/error-not-login'); //ERR 500
  }
})
// role=2
router.post("/update-movie-admin", function (req, res, next) {
  if (CheckLogin(2, res, req)) {
    var _id = req.body.id;
    var _title = req.body.title;
    var _producer = req.body.producer;
    var _deadline = req.body.deadline;
    var _createnote = req.body.note;
    var params = {
      TableName: "Movies",
      Key: {
        id: _id
      },
      UpdateExpression:
        "set #a=:a, #b=:b, #c=:c, #d=:d",
      ExpressionAttributeNames: {
        "#a": "title",
        "#b": "info.producer",
        "#c": "process.create.deadline",
        "#d": "process.create.createnote"
      },
      ExpressionAttributeValues: {
        ":a": _title,
        ":b": _producer,
        ":c": _deadline,
        ":d": _createnote
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
        return res.redirect("/movie/list-movie-waiting-register-write");
      }
    });
  } else {
    return res.redirect('/error-not-login'); //ERR 500
  }
})
// =============================================
// Get All List Register role=2
router.get("/list-movie-registed", function (req, res, next) {
  if (CheckLogin(2, res, req)) {
    var email = req.session.passport.user.email?req.session.passport.user.email:req.session.passport.user.Items[0].info.email;
    var params = {
      TableName: "Movies",
      // ProjectionExpression: "#status",
      FilterExpression: "(#stt=:stt) AND (process.registion.register[1]=:email) ",
      ExpressionAttributeNames: {
        "#stt": "stt",
      },
      ExpressionAttributeValues: {
        ":stt": 3,
        ":email": email
      }
    };
    docClient.scan(params, function (error, result) {
      if (error) {
        console.error(
          "Unable to query. Error:",
          JSON.stringify(error, null, 2)
        );
      } else {
        // console.log(JSON.stringify(result))
        var titletab = "List Movies Registed";
        res.render("../views/movies/list-movie-registed.ejs", { result, moment: moment, titletab });
      }
    });
  } else {
    return res.redirect('/error-not-login');//ERR 500
  }
});
// ==end==
// GET List movie waiting register write ==role=2
router.get("/list-movie-waiting-register-write", function (req, res, next) {
  if (CheckLogin(2, res, req)) {
    var params = {
      TableName: "Movies",
      // ProjectionExpression: "#status",
      FilterExpression: "#stt=:stt OR #stt=:stt1",
      ExpressionAttributeNames: {
        "#stt": "stt"
      },
      ExpressionAttributeValues: {
        ":stt": 4,
        ":stt1": 3
      }
      // Limit: 30
    };
    docClient.scan(params, function (error, result) {
      if (error) {
        console.error(
          "Unable to query. Error:",
          JSON.stringify(error, null, 2)
        );
      } else {
        var titletab = "List Movies Waiting Register";
        var role=req.session.passport.user.role?req.session.passport.user.role:req.session.passport.user.Items[0].role
        res.render("../views/movies/list-movie-waiting-register-write.ejs", {
          result, role: role, moment: moment, titletab
        });
      }
    });
  } else {
    return res.redirect('/error-not-login'); //ERR 500
  }
});
// =========Register movie========= role=2
router.post("/member-register-movie", function (req, res, next) {
  if (CheckLogin(2, res, req)) {

    var id = req.body.id;
    var fullname=req.session.passport.user.fullname?req.session.passport.user.fullname:req.session.passport.user.Items[0].info.fullname
    var email=req.session.passport.user.email?req.session.passport.user.email:req.session.passport.user.Items[0].info.email
    var now = new Date();
    var registiondate = dateFormat(now, "isoDate");
    var title = req.body.title;
    var params = {
      TableName: "Movies",
      Key: {
        id: id
      },
      UpdateExpression:
        "set stt=:st, process.registion=:wr",
      ExpressionAttributeValues: {
        ":st": 3,
        ":wr": {
          "register": [fullname, email],
          "registiondate": registiondate
        }
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
        return res.send(true);
      }
    });
  } else {
    return res.redirect('/error-not-login');//ERR 500
  }
});

// ========= Get writing movie===== role=2
router.get("/member-writing-movie", function (req, res, next) {
  if (CheckLogin(2, res, req)) {
    var _id = req.query.id;
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
        var titletab = "Movie Writing";
        if (data.Count > 0) {
          return res.render("../views/movies/member-writing-movie.ejs", { data, moment: moment, titletab });
        }
      }
    });
  } else {
    return res.redirect('/error-not-login'); //ERR 500
  }
});

// =========Register movie=========
// =========Writing Movie of writer=============== role=2
router.post("/member-submit-movie", s3upload.single("posterimage"), function (req, res, next) {
  if (CheckLogin(2, res, req)) {
    var id = req.body.id;
    var director = req.body.director;
    var distance = req.body.distance;
    var publicationdate = req.body.publicationdate;
    var actor = req.body.actor;
    var typemovie = req.body.typemovie;
    var country = req.body.country;
    var posterimage = imgname;
    var trailer = req.body.trailer;
    var content = req.body.content;
    var now = new Date();
    var dateofwrite = dateFormat(now, "isoDate");
    var params = {
      TableName: "Movies",
      Key: {
        id: id
      },
      UpdateExpression:
        "set stt=:st, info.movietype=:a,info.actor=:b,info.director=:c,info.country=:d,info.distance=:e,info.posterimage=:f,info.trailer=:g,info.content=:h,info.publicationdate=:i, process.approve=:ap",
      ExpressionAttributeValues: {
        ":st": 2,
        ":a": [typemovie],
        ":b": [actor],
        ":c": director,
        ":d": country,
        ":e": distance,
        ":f": posterimage,
        ":g": trailer,
        ":h": content,
        ":i": publicationdate,

        ":ap": {
          "submitiondate": dateofwrite,
        }
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

        return res.redirect("/movie/list-movie-registed");
        imgname = "";
      }
    });
  } else {
    return res.redirect('/error-not-login'); //ERR 500
  }
});

// ========Approve======== role=3
router.get("/get-admin-approve-movie", function (req, res, next) {
  if (CheckLogin(3, res, req)) {
    var role = 2;
    var params = {
      TableName: "Movies",
      // ProjectionExpression: "#status",
      FilterExpression: "#stt=:stt",
      ExpressionAttributeNames: {
        "#stt": "stt"
      },
      ExpressionAttributeValues: {
        ":stt": role
      }
      // Limit: 30
    };
    docClient.scan(params, function (error, result) {
      if (error) {
        console.error("Unable to query. Error:", JSON.stringify(error, null, 2));
      } else {
        var titletab = "List Movies Approve";
        res.render("../views/movies/admin-approve-movie.ejs", { result, moment: moment, titletab });
      }
    });
  } else {
    return res.redirect('/error-not-login'); //ERR 500
  }
});
// ========End Approve====
// ================Approved======================= role=3
router.post("/admin-approve-movie", function (req, res, next) {
  if (CheckLogin(3, res, req)) {
    var approver=req.session.passport.user.fullname?req.session.passport.user.fullname:req.session.passport.user.Items[0].info.fullname
      var approveremail=req.session.passport.user.email?req.session.passport.user.email:req.session.passport.user.Items[0].info.email
    var id = req.body.id;
    var now = new Date();
    var dateofapproved = dateFormat(now, "isoDate");
    var params = {
      TableName: "Movies",
      Key: {
        id: id
      },
      UpdateExpression:
        "set stt=:st, process.approve.approver=:a, process.approve.dateofapprove=:b",
      ExpressionAttributeValues: {
        ":st": 1,
        ":a": [approver, approveremail],
        ":b": dateofapproved,
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
        UpdateNotify(id);
        UpdateCloudSearch(id);
        return res.send(true);
      }
    });
  } else {
    return res.redirect('/error-not-login'); //ERR 500
  }
});

// =============end Approved======================

// ================== Get List approving member=== role=2

router.get("/list-approving-member", function (req, res, next) {
  if (CheckLogin(2, res, req)) {
    var email = req.session.passport.user.email?req.session.passport.user.email:req.session.passport.user.Items[0].info.email
    var params = {
      TableName: "Movies",
      // ProjectionExpression: "#status",
      FilterExpression: "(#stt=:stt) AND (process.registion.register[1]=:email) ",
      ExpressionAttributeNames: {
        "#stt": "stt"
      },
      ExpressionAttributeValues: {
        ":stt": 2,
        ":email": email
      }
      // Limit: 30
    };
    docClient.scan(params, function (error, data) {
      if (error) {
        console.error(
          "Unable to query. Error:",
          JSON.stringify(error, null, 2)
        );
      } else {
        var titletab = "List Movies Waiting Approve";
        res.render("../views/movies/list-approving-member.ejs", { data, moment: moment, titletab });
      }
    });
  } else {
    return res.redirect('/error-not-login'); //ERR 500
  }
});

// ===============================================

// ================Unapprove======================= role=3
router.post("/unapprove-movie-admin", function (req, res, next) {
  if (CheckLogin(3, res, req)) {
    var id = req.body.id;
    var complaint = req.body.note;
    var params = {
      TableName: "Movies",
      Key: {
        id: id
      },
      UpdateExpression:
        "set process.approve.complaint=:a",
      ExpressionAttributeValues: {
        ":a": complaint
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
        return res.send(true);
      }
    });
  } else {
    return res.redirect('/error-not-login'); //ERR 500
  }
});
// =============end Unapprove======================




// ================Delete Movie======================= role 3
router.post("/delete-movie-admin", function (req, res, next) {
  if (CheckLogin(3, res, req)) {
    //====
    var id = req.body.id;
    var role = req.session.passport.user.role?req.session.passport.user.role:req.session.passport.user.Items[0].role;
    if (role > 2) {
      //
      var params = {
        TableName: "Movies",
        Key: {
          id: id
        }
      };
      var param1s = {
        TableName: "Movies",
        KeyConditionExpression: "id=:id",
        ExpressionAttributeValues: {
          ":id": id
        }
      };
      docClient.query(param1s, function (err, result) { //lay file hinh
        if (err) {
          console.error(
            "Unable to read item. Error JSON:",
            JSON.stringify(err, null, 2)
          );
        } else {
          var img = "";
          var stt = "";
          result.Items.forEach(function (i) {
            img = i.info.posterimage;//.slice(-45);
            stt = i.stt;
          })
          if (stt == 4 || stt == 3) {
            //Xoa item
            docClient.delete(params, function (err, data) {
              if (err) {
                console.error(
                  "Unable to delete item. Error JSON:",
                  JSON.stringify(err, null, 2)
                );
              } else {
                if (data) {                 
                  return res.send(true);
                }
                else {
                  return res.send(false);
                }
              }
            });

          }
          else {
            if(stt==1)
            {
              DeleteCloudSearch(id);
            }
            s3Fs.unlink(img, function (err, data) {//Xoa img s3
              if (err) {
                throw err;
              }
              else { //Xoa xoa item
                docClient.delete(params, function (err, data) {
                  if (err) {
                    console.error(
                      "Unable to delete item. Error JSON:",
                      JSON.stringify(err, null, 2)
                    );
                  } else {
                   
                    return res.send(true);
                  }
                });
              }
            })
          }
        }
      });
    } else {
      return res.send("ERROR ROLE UNVALID");
    }
  } else {
    return res.redirect('/error-not-login'); //ERR 500
  }

});
// =============End delete movie======================




// =============Unregister============================role=2
router.post("/unregister-movie-member", function (req, res, next) {
  if (CheckLogin(2, res, req)) {
    var id = req.body.id;
    var now = new Date();
    var params = {
      TableName: "Movies",
      Key: {
        id: id
      },
      UpdateExpression: "remove process.registion",
      // ExpressionAttributeValues: {
      //   ":st": 2
      // },
      ReturnValues: "UPDATED_NEW"
    };
    docClient.update(params, function (err, data) {
      if (err) {
        console.error(
          "Unable to update item. Error JSON:",
          JSON.stringify(err, null, 2)
        );
      } else {
        var params1 = {
          TableName: "Movies",
          Key: {
            id: id

          },
          UpdateExpression: "set stt=:st",
          ExpressionAttributeValues: {
            ":st": 4
          },
          ReturnValues: "UPDATED_NEW"
        };
        docClient.update(params1, function (err, data) {
          if (err) {
            console.error(
              "Unable to update item. Error JSON:",
              JSON.stringify(err, null, 2)
            );
          } else {
            return res.send(true);
          }
        });
      }
    });
  } else {
    return res.redirect('/error-not-login'); //ERR 500
  }
});
// =============End Unregister============================
// ==========Update Movie Member========================== role=2

router.get("/get-update-movie-member", function (req, res, next) {
  if (CheckLogin(2, res, req)) {
    var _id = req.query.id;
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
        var titletab = "Movie Update";
        return res.render("../views/movies/update-movie-member.ejs", { data, moment: moment, titletab });
      }
    });
  } else {
    return res.redirect('/error-not-login'); //ERR 500
  }
});
// ============ Role =3
router.get("/get-update-movie-admin", function (req, res, next) {
  if (CheckLogin(3, res, req)) {
    var _id = req.query.id;
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
        var titletab = "Movie Update";
        return res.render("../views/movies/admin-update-content-movie.ejs", { data, moment: moment, titletab });
      }
    });
  } else {
    return res.redirect('/error-not-login'); //ERR 500
  }
});
// =========== role=2
router.post("/update-movie-member", s3upload.single("posterimage"), function (req, res, next) {
  if (CheckLogin(2, res, req)) {
    var id = req.body.id;
    var director = req.body.director;
    var distance = req.body.distance;
    var publicationdate = req.body.publicationdate;
    var actor = req.body.actor;
    var typemovie = req.body.typemovie;
    var country = req.body.country;
    var posterimage = imgname;
    var trailer = req.body.trailer;
    var content = req.body.content;
    var imgold = req.body.imgold; //bien nay luu ten cua img cu khi co su thay doi ve hinh anh.. de xoa trong s3

    if (imgname == "") {
      var params = {
        TableName: "Movies",
        Key: {
          id: id
        },
        UpdateExpression:
          "set stt=:st, info.director=:a, info.distance=:b, info.publicationdate=:c, info.actor=:d, info.movietype=:e, info.trailer=:h, info.content=:i, info.country=:l",
        ExpressionAttributeValues: {
          ":st": 2,
          ":a": director,
          ":b": distance,
          ":c": publicationdate,
          ":d": actor,
          ":e": typemovie,
          ":l": country,
          ":h": trailer,
          ":i": content
        },
        ReturnValues: "UPDATED_NEW"
      };
      docClient.update(params, function (err, data) {
        if (err) {
          console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
          return res.redirect("/movie/list-approving-member");
          imgname = "";
        }
      });
    } else {
      var params = {
        TableName: "Movies",
        Key: {
          id: id
        },
        UpdateExpression:
          "set stt=:st, info.director=:a, info.distance=:b, info.publicationdate=:c, info.actor=:d, info.movietype=:e, info.posterimage=:g, info.trailer=:h, info.content=:i,  info.country=:l",
        ExpressionAttributeValues: {
          ":st": 2,
          ":a": director,
          ":b": distance,
          ":c": publicationdate,
          ":d": actor,
          ":e": typemovie,
          ":l": country,
          ":g": posterimage,
          ":h": trailer,
          ":i": content,
        },
        ReturnValues: "UPDATED_NEW"
      };
    }

    s3Fs.unlink(imgold, function (err, data) {//Xoa img s3
      if (err) {
        throw err;
      }
      else { //Xoa dynamodb
        docClient.update(params, function (err, data) {
          if (err) {
            console.error(
              "Unable to update item. Error JSON:",
              JSON.stringify(err, null, 2)
            );
          } else {
            return res.redirect("/movie/list-approving-member");
            imgname = "";
          }
        });
      }
    })
  } else {
    return res.redirect('/error-not-login'); //ERR 500
  }

  //Hướng phát triển: Sau này nếu member update trong trường hợp bài viết đã được approve .Khi update lại sẽ tạo ra 1 bản mới và 1 bản củ để admin lựa chọn dữ lại bản củ hay lấy bản mới.
})
// ========role=3
router.post("/update-content-movie-admin", s3upload.single("posterimage"), function (req, res, next) {
  if (CheckLogin(3,res, req)) {
    var _title = req.body.title;
    var producer = req.body.producer;
    var id = req.body.id;
    var director = req.body.director;
    var distance = req.body.distance;
    var publicationdate = req.body.publicationdate;
    var actor = req.body.actor;
    var typemovie = req.body.typemovie;
    var country = req.body.country;
    var posterimage = imgname;
    var trailer = req.body.trailer;
    var content = req.body.content;
    var imgold = req.body.imgold; //bien nay luu ten cua img cu khi co su thay doi ve hinh anh.. de xoa trong s3

    if (imgname == "") {
      var params = {
        TableName: "Movies",
        Key: {
          id: id
        },
        UpdateExpression: "set title=:g, info.producer=:f, info.director=:a, info.distance=:b, info.publicationdate=:c, info.actor=:d, info.movietype=:e, info.trailer=:h, info.content=:i, info.country=:l",
        ExpressionAttributeValues: {

          ":a": director,
          ":b": distance,
          ":c": publicationdate,
          ":d": actor,
          ":e": typemovie,
          ":l": country,
          ":h": trailer,
          ":i": content,
          ":g": _title,
          ":f": producer
        },
        ReturnValues: "UPDATED_NEW"
      };
      docClient.update(params, function (err, data) {
        if (err) {
          console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
        } else {

          imgname = "";
          return res.redirect("/pageadmin");
        }
      });
    } else {
      var params = {
        TableName: "Movies",
        Key: {
          id: id
        },
        UpdateExpression:
          "set stt=:st, info.director=:a, info.distance=:b, info.publicationdate=:c, info.actor=:d, info.movietype=:e, info.posterimage=:g, info.trailer=:h, info.content=:i, title=:t, info.country=:l",
        ExpressionAttributeValues: {
          ":st": 1,
          ":a": director,
          ":b": distance,
          ":c": publicationdate,
          ":d": [actor],
          ":e": [typemovie],
          ":l": country,
          ":g": posterimage,
          ":h": trailer,
          ":i": content,
          ":t":_title
        },
        ReturnValues: "UPDATED_NEW"
      };
    s3Fs.unlink(imgold, function (err, data) {//Xoa img s3
      if (err) {
        throw err;
      }
      else { //Xoa dynamodb
        docClient.update(params, function (err, data) {
          if (err) {
            console.error(
              "Unable to update item. Error JSON:",
              JSON.stringify(err, null, 2)
            );
          } else {
            return res.redirect("/movie/list-approving-member");
            imgname = "";
          }
        });
      }
    })
  }
  } else {
    return res.redirect('/error-not-login'); //ERR 500
  }

  //Hướng phát triển: Sau này nếu member update trong trường hợp bài viết đã được approve .Khi update lại sẽ tạo ra 1 bản mới và 1 bản củ để admin lựa chọn dữ lại bản củ hay lấy bản mới.
})
// =================Delete Create Admin====================== role =3
router.post("/delete-create-movie-admin", function (req, res, next) {
  if (CheckLogin(3, res, req)) {
    var id = req.body.id;
    var role = req.session.passport.user.role?req.session.passport.user.role:req.session.passport.user.Items[0].role;
    if (role > 2) {
      var params = {
        TableName: "Movies",
        Key: {
          id: id
        }
      };

      docClient.delete(params, function (err, data) {
        if (err) {
          console.error(
            "Unable to delete item. Error JSON:",
            JSON.stringify(err, null, 2)
          );
        } else {
          return res.send(true);
        }
      });

    } else {
      return res.send("ERROR ROLE UNVALID");
    }
  } else {
    return res.redirect('/error-not-login'); //ERR 500;
  }
});
// ==========================================================


//  ===========List Movie of Member writed===============role =2
router.get("/get-list-writed-member", function (req, res, next) {
  if (CheckLogin(2, res, req)) {
    var email = req.session.passport.user.email?req.session.passport.user.email:req.session.passport.user.Items[0].info.email;
    var params = {
      TableName: "Movies",
      // ProjectionExpression: "#status",
      FilterExpression: "(#stt<=:stt) AND (process.registion.register[1]=:email)",
      ExpressionAttributeNames: {
        "#stt": "stt"
      },
      ExpressionAttributeValues: {
        ":stt": 3,
        ":email": email
      }
      // Limit: 30
    };
    docClient.scan(params, function (error, data) {
      if (error) {
        console.error(
          "Unable to query. Error:",
          JSON.stringify(error, null, 2)
        );
      } else {
        var titletab = "List Movies Writed";
        res.render("../views/movies/list-movie-member-writed.ejs", { data, moment: moment, titletab });
      }
    });
  } else {
    return res.redirect('/error-not-login'); //ERR 500
  }
})
// ==========Get all movie for Admin list manager======== role=3
router.get("/get-list-movie-admin", function (req, res, next) {
  if (CheckLogin(3, res, req)) {
    // var email = req.session.passport.user.email;
    var params = {
      TableName: "Movies"
    };
    docClient.scan(params, function (error, data) {
      if (error) {
        console.error(
          "Unable to query. Error:",
          JSON.stringify(error, null, 2)
        );
      } else {
        var titletab = "List Movies";
        res.render("../views/movies/manager-movie-admin.ejs", { data, moment: moment, titletab });
      }
    });
  } else {
    return res.redirect('/error-not-login'); //ERR 500
  }
})
// ======================================================
// >>>>>>> Stashed changes
// =======================================================


// =========== Comment=================================== chua test=== function rating and comment for user ... and developing
router.post("/comment-movie", function (req, res, next) {
  if (CheckLogin(1, res, req)) {
    var id_cmter = req.session.passport.user.id?req.session.passport.user.id:req.session.passport.user.Items[0].id;
    var fullname_cmter = req.session.passport.user.fullname?req.session.passport.user.fullname:req.session.passport.user.Items[0].info.fullname;
    var email_cmter = req.session.passport.user.email?req.session.passport.user.email:req.session.passport.user.Items[0].info.email;
    var movie_id = req.body.id;
    var now = new Date();
    var timecmt = dateFormat(now, "shortTime");
    var daycmt = dateFormat(now, 'isoDate');
    var start = req.body.rating;
    if (!start) {
      start = 0;
    }
    var content_cmt = req.body.content_cmt;
    if (!content_cmt) {
      content_cmt = "----no comment----"
    }
    // =================================
    var params = {
      TableName: "Movies",
      KeyConditionExpression: "id=:id",
      ExpressionAttributeValues: {
        ":id": movie_id
      }
    };
    docClient.query(params, function (err, data) {
      if (err) {
        console.error(
          "Unable to read item. Error JSON:",
          JSON.stringify(err, null, 2)
        );
      } else {
        var isexits = false;
        data.Items.forEach((j) => {
          if (j.comment) {
            isexits = true;
          }
          else
            isexits = false;
        })
        if (isexits) {

          var params = {
            TableName: "Movies",
            Key: {
              id: movie_id
            },
            UpdateExpression:
              "set #comment=list_append(#comment, :cmt), #ratings=list_append(#ratings, :rat)",
            ExpressionAttributeNames: {
              "#comment": "comment",
              "#ratings": "ratings"
            },
            ExpressionAttributeValues: {
              ":cmt":
                [{
                  commenter: [fullname_cmter, email_cmter, id_cmter],
                  contentcmt: content_cmt,
                  rating: start,
                  time: [timecmt, daycmt]
                }]
              ,
              ":rat": [start]
            },
            ReturnValues: "ALL_NEW"
          };
          docClient.update(params, function (err, data) {
            if (err) {
              console.error(
                "Unable to update item. Error JSON:",
                JSON.stringify(err, null, 2)
              );
            } else {
              return res.send(true);
            }
          });
        }
        else {
          var params = {
            TableName: "Movies",
            Key: {
              id: movie_id
            },
            UpdateExpression:
              "set #comment=:cmt, #ratings=:rat",
            ExpressionAttributeNames: {
              "#comment": "comment",
              "#ratings": "ratings"
            },
            ExpressionAttributeValues: {
              ":cmt":
                [{
                  commenter: [fullname_cmter, email_cmter, id_cmter],
                  contentcmt: content_cmt,
                  rating: start,
                  time: [timecmt, daycmt]
                }]
              ,
              ":rat": [start]
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
              return res.send(true);
            }
          });
        }
      }
    });

    // ==================================

  }
  else {
    return res.redirect('/error-not-login'); //ERR 500
  }
})
// ===============Dislike=========================
router.post("/dislike-movie", function (req, res, next) {
  if (CheckLogin(1, res, req)) {
    var id_liker = req.session.passport.user.id?req.session.passport.user.id:req.session.passport.user.Items[0].id;
    var movie_id = req.body.id;
    var index = req.body.index;
    var str = "remove #like[" + index + "]";
    var params = {
      TableName: "Movies",
      Key: {
        id: movie_id
      },
      UpdateExpression:
        str,
      ExpressionAttributeNames: {
        "#like": "liker"
      },
      // ExpressionAttributeValues: {

      //   ":cnt": 1
      // },
      ReturnValues: "ALL_NEW"
    };
    docClient.update(params, function (err, data) {
      if (err) {
        console.error(
          "Unable to update item. Error JSON:",
          JSON.stringify(err, null, 2)
        );
      } else {
        return res.send(true);
      }
    });
  }
  else {
    return res.redirect('/error-not-login'); //ERR 500
  }
})
// ======================================================
router.post("/like-movie", function (req, res, next) {
  if (CheckLogin(1, res, req)) {
    var id_liker =req.session.passport.user.id?req.session.passport.user.id:req.session.passport.user.Items[0].id;
    var movie_id = req.body.id;
    var params = {
      TableName: "Movies",
      KeyConditionExpression: "id=:id",
      ExpressionAttributeValues: {
        ":id": movie_id
      }
    };
    docClient.query(params, function (err, data) {
      if (err) {
        console.error(
          "Unable to read item. Error JSON:",
          JSON.stringify(err, null, 2)
        );
      } else {
        var isexits = false;
        data.Items.forEach((j) => {
          if (j.liker) {
            isexits = true;
          }
          else {
            isexits = false;
          }

        })

        if (isexits) {
          var params = {
            TableName: "Movies",
            Key: {
              id: movie_id
            },
            UpdateExpression:
              "set #like=list_append(#like, :like), countlike=countlike+:cnt",
            ExpressionAttributeNames: {
              "#like": "liker"
            },
            ExpressionAttributeValues: {
              ":like": [id_liker],
              ":cnt": 1
            },
            ReturnValues: "ALL_NEW"
          };
          docClient.update(params, function (err, data) {
            if (err) {
              console.error(
                "Unable to update item. Error JSON:",
                JSON.stringify(err, null, 2)
              );
            } else {
              return res.send(true);
            }
          });
        }
        else {
          var params = {
            TableName: "Movies",
            Key: {
              id: movie_id
            },
            UpdateExpression:
              "set #like=:like, #countlike=:cnt",
            ExpressionAttributeNames: {
              "#like": "liker",
              "#countlike": "countlike"
            },
            ExpressionAttributeValues: {
              ":like":
                [
                  id_liker
                ]
              ,
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
              return res.send(true);
            }
          });
        }
      }
    });
  }
  else {
    return res.redirect('/error-not-login'); //ERR 500
  }
})
// ======================================================
// ========GET MOVIE======
router.get("/detail-cmt-movie", function (req, res, next) {
  // var _title = req.body.title;
  var _id = req.query.id;
  var params = {
    TableName: "Movies",
    // ProjectionExpression:"#comment",
    KeyConditionExpression: "id=:id",
    // ExpressionAttributeNames:{
    //   "#comment":"comment"
    // },
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
      return res.send(data);
    }

  });
});
// ========End GET MOVIE==


// ======DELETE CMT=========
// function getindexArr(movie_id,info)
// {
//   var y=0;
//   var params = {
//     TableName: "Movies",
//     KeyConditionExpression: "id=:id",
//     ExpressionAttributeValues: {
//       ":id": movie_id
//     }
//   };
//   docClient.query(params, function (err, data) {
//     if (err) {
//       console.error(
//         "Unable to read item. Error JSON:",
//         JSON.stringify(err, null, 2)
//       );
//     } else {

//       var x = 0;
//       data.Items.forEach((i) => {
//         i.comment.forEach((j) => {
//           if (j.commenter[2] == info.commenter[2] && j.time[0]== info.time[0]&& j.time[1]== info.time[1]) {
//             y=x;
//           }
//           x++;
//         })
//       })
//     }
//     return y;
//   }); 
// }
// function deletecmt(movie_id, index) {
//   var str = "remove #cmt[" + index + "]"
//   var param = {
//     TableName: "Movies",
//     Key: {
//       id: movie_id
//     },
//     UpdateExpression:
//       str,
//     ExpressionAttributeNames: {
//       "#cmt": "comment"
//     },
//     ReturnValues: "ALL_NEW"
//   };
//   docClient.update(param, function (err, data) {
//     if (err) {
//       console.error(
//         "Unable to update item. Error JSON:",
//         JSON.stringify(err, null, 2)
//       );
//     } else {
//       if (data) {
//         return true;
//       }
//       else {
//         return false;
//       }
//     }
//   });
// }
router.post("/delete-cmt-movie", function (req, res, next) {
  if (CheckLogin(1, res, req)) {
    var movie_id = req.body.id;
    var index = req.body.index;
    var str = "remove #cmt[" + index + "]"
    var param = {
      TableName: "Movies",
      Key: {
        id: movie_id
      },
      UpdateExpression:
        str,
      ExpressionAttributeNames: {
        "#cmt": "comment"
      },
      ReturnValues: "ALL_NEW"
    };
    docClient.update(param, function (err, data) {
      if (err) {
        console.error(
          "Unable to update item. Error JSON:",
          JSON.stringify(err, null, 2)
        );
      } else {
        return res.send(true);
      }
    });
  }
  else {
    return res.redirect('/error-not-login'); //ERR 500
  }
})
// =========================


// ==============Edit cmt===================
router.post("/edit-comment-movie", function (req, res, next) {
  if (CheckLogin(1, res, req)) {
    var movie_id = req.body.id;
    var content = req.body.content;
    var index = req.body.index;
    // =================================
    var str = "set #cmt[" + index + "].contentcmt=:cmt"
    var params = {
      TableName: "Movies",
      Key: {
        id: movie_id
      },
      UpdateExpression:
        str,
      ExpressionAttributeNames: {
        "#cmt": "comment"
      },
      ExpressionAttributeValues: {
        ":cmt": content
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
        return res.send(true);
      }
    });

  }
  else {
    return res.redirect('/error-not-login'); //ERR 500
  }
})
// =========================================
// ========= Live Search====================


//title
router.get("/get-key-search", function (req, res, next) {
  var title = req.query.title;
  if (title == "") {
    return res.send(false)
  } else {

    var params = {
      TableName: "Movies",
      ProjectionExpression: "#name,id",
      FilterExpression: "begins_with(#name, :name) or contains(#name,:name) ",
      ExpressionAttributeNames: {
        "#name": "title"
      },
      ExpressionAttributeValues: {
        ":name": title
      }
    };
    docClient.scan(params, function (err, data) {
      if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
      } else {
        return res.send(data);
      }
    });
  }
})

//type
// router.get("/get-key-typemovie", function (req, res, next) {
//   var title = req.query.title;
//   if (title == "") {
//     return res.send(false)
//   } else {

//     var params = {
//       TableName: "Movies",
//       ProjectionExpression: "#name,id",
//       FilterExpression: "begins_with(#name, :name) or contains(#name,:name) ",
//       ExpressionAttributeNames: {
//         "#name": "title"
//       },
//       ExpressionAttributeValues: {
//         ":name": title
//       }
//     };
//     docClient.scan(params, function (err, data) {
//       if (err) {
//         console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
//       } else {
//         return res.send(data);
//       }
//     });
//   }
// })

//producer
// router.get("/get-key-producer", function (req, res, next) {
//   var title = req.query.title;
//   if (title == "") {
//     return res.send(false)
//   } else {
//     var params = {
//       TableName: "Movies",
//       ProjectionExpression: "#name,id",
//       FilterExpression: "begins_with(#name, :name) or contains(#name,:name) ",
//       ExpressionAttributeNames: {
//         "#name": "title"
//       },
//       ExpressionAttributeValues: {
//         ":name": title
//       }
//     };
//     docClient.scan(params, function (err, data) {
//       if (err) {
//         console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
//       } else {
//         return res.send(data);
//       }
//     });
//   }
// })

//country
router.get("/get-key-search", function (req, res, next) {
  var title = req.query.title;
  if (title == "") {
    return res.send(false)
  } else {

    var params = {
      TableName: "Movies",
      ProjectionExpression: "#name,id",
      FilterExpression: "begins_with(#name, :name) or contains(#name,:name) ",
      ExpressionAttributeNames: {
        "#name": "title"
      },
      ExpressionAttributeValues: {
        ":name": title
      }
    };
    docClient.scan(params, function (err, data) {
      if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
      } else {
        return res.send(data);
      }
    });
  }
})

//director
router.get("/get-key-search", function (req, res, next) {
  var title = req.query.title;
  if (title == "") {
    return res.send(false)
  } else {

    var params = {
      TableName: "Movies",
      ProjectionExpression: "#name,id",
      FilterExpression: "begins_with(#name, :name) or contains(#name,:name) ",
      ExpressionAttributeNames: {
        "#name": "title"
      },
      ExpressionAttributeValues: {
        ":name": title
      }
    };
    docClient.scan(params, function (err, data) {
      if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
      } else {
        return res.send(data);
      }
    });
  }
})
//================================================FUNCTION=================================================

//Update count film for notify
function UpdateNotify(idmovie) {

  var param = {
    TableName: "Movies",
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: {
      ":id": idmovie
    }
  };

  docClient.query(param, function (err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      data.Items.forEach(function (item) {
        var title = item.title;
        var imageurl = item.info.posterimage;
        var content = item.info.content.slice(3, 53) + "...";
        var params = {
          TableName: "Notification",
          Key: {
            id: 'notification'
          },
          UpdateExpression:
            "set #a=list_append(#a,:a), #b=list_append(#b,:b), #c=list_append(#c,:c), #d=list_append(#d,:d), #count=#count+:val",
          ExpressionAttributeNames: {
            "#a": "idmovies",
            "#b": "titles",
            "#c": "urlimages",
            "#d": "contents",
            "#count": "count"
          },
          ExpressionAttributeValues: {
            ":a": [idmovie],
            ":b": [title],
            ":c": [imageurl],
            ":d": [content],
            ":val": 1
          },
          ReturnValues: "UPDATED_NEW"
        };
        docClient.update(params, function (err, data1) {
          if (err) {
            console.error(
              "Unable to update item. Error JSON:",
              JSON.stringify(err, null, 2)
            );
          } else {
            if (data1.Attributes.count == 6) {
              SendMailing();
            }
            return true;
          }
        });
      });
    }
  })
}
//Send mail notify for member subcribe page when count of notify is 6
function SendMailing() {
  var params = {
    TableName: "Notification",
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: {
      ":id": 'notification'
    }
  };

  docClient.query(params, function (err, data) {
    if (err) {
      console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      data.Items.forEach((i) => {
        //HEADER MAIL
        var str="";
        str+='<!doctype html public "-//w3c//dtd xhtml 1.0 transitional //en" "http://www.w3.org/tr/xhtml1/dtd/xhtml1-transitional.dtd">'
str+=''
str+='<html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml">'
str+='<head>'
str+='	<!--[if gte mso 9]><xml><o:officedocumentsettings><o:allowpng/><o:pixelsperinch>96</o:pixelsperinch></o:officedocumentsettings></xml><![endif]-->'
str+='	<meta content="text/html; charset=utf-8" http-equiv="content-type"/>'
str+='	<meta content="width=device-width" name="viewport"/>'
str+='	<!--[if !mso]><!-->'
str+='	<meta content="ie=edge" http-equiv="x-ua-compatible"/>'
str+='	<!--<![endif]-->'
str+='	<title></title>'
str+='	<!--[if !mso]><!-->'
str+='	<link href="https://fonts.googleapis.com/css?family=roboto" rel="stylesheet" type="text/css"/>'
str+='	<link href="https://fonts.googleapis.com/css?family=ubuntu" rel="stylesheet" type="text/css"/>'
str+='	<link href="https://fonts.googleapis.com/css?family=montserrat" rel="stylesheet" type="text/css"/>'
str+='	<link href="https://fonts.googleapis.com/css?family=droid+serif" rel="stylesheet" type="text/css"/>'
str+='	<!--<![endif]-->'
str+='	<style type="text/css">'
str+='	body {'
str+='		margin: 0;'
str+='		padding: 0;'
str+='	}'
str+=''
str+='	table,'
str+='	td,'
str+='	tr {'
str+='		vertical-align: top;'
str+='		border-collapse: collapse;'
str+='	}'
str+=''
str+='	* {'
str+='		line-height: inherit;'
str+='	}'
str+=''
str+='	a[x-apple-data-detectors=true] {'
str+='		color: inherit !important;'
str+='		text-decoration: none !important;'
str+='	}'
str+=''
str+='	.ie-browser table {'
str+='		table-layout: fixed;'
str+='	}'
str+=''
str+='	[owa] .img-container div,'
str+='	[owa] .img-container button {'
str+='		display: block !important;'
str+='	}'
str+=''
str+='	[owa] .fullwidth button {'
str+='		width: 100% !important;'
str+='	}'
str+=''
str+='	[owa] .block-grid .col {'
str+='		display: table-cell;'
str+='		float: none !important;'
str+='		vertical-align: top;'
str+='	}'
str+=''
str+='	.ie-browser .block-grid,'
str+='	.ie-browser .num12,'
str+='	[owa] .num12,'
str+='	[owa] .block-grid {'
str+='		width: 670px !important;'
str+='	}'
str+=''
str+='	.ie-browser .mixed-two-up .num4,'
str+='	[owa] .mixed-two-up .num4 {'
str+='		width: 220px !important;'
str+='	}'
str+=''
str+='	.ie-browser .mixed-two-up .num8,'
str+='	[owa] .mixed-two-up .num8 {'
str+='		width: 440px !important;'
str+='	}'
str+=''
str+='	.ie-browser .block-grid.two-up .col,'
str+='	[owa] .block-grid.two-up .col {'
str+='		width: 330px !important;'
str+='	}'
str+=''
str+='	.ie-browser .block-grid.three-up .col,'
str+='	[owa] .block-grid.three-up .col {'
str+='		width: 330px !important;'
str+='	}'
str+=''
str+='	.ie-browser .block-grid.four-up .col [owa] .block-grid.four-up .col {'
str+='		width: 165px !important;'
str+='	}'
str+=''
str+='	.ie-browser .block-grid.five-up .col [owa] .block-grid.five-up .col {'
str+='		width: 134px !important;'
str+='	}'
str+=''
str+='	.ie-browser .block-grid.six-up .col,'
str+='	[owa] .block-grid.six-up .col {'
str+='		width: 111px !important;'
str+='	}'
str+=''
str+='	.ie-browser .block-grid.seven-up .col,'
str+='	[owa] .block-grid.seven-up .col {'
str+='		width: 95px !important;'
str+='	}'
str+=''
str+='	.ie-browser .block-grid.eight-up .col,'
str+='	[owa] .block-grid.eight-up .col {'
str+='		width: 83px !important;'
str+='	}'
str+=''
str+='	.ie-browser .block-grid.nine-up .col,'
str+='	[owa] .block-grid.nine-up .col {'
str+='		width: 74px !important;'
str+='	}'
str+=''
str+='	.ie-browser .block-grid.ten-up .col,'
str+='	[owa] .block-grid.ten-up .col {'
str+='		width: 60px !important;'
str+='	}'
str+=''
str+='	.ie-browser .block-grid.eleven-up .col,'
str+='	[owa] .block-grid.eleven-up .col {'
str+='		width: 54px !important;'
str+='	}'
str+=''
str+='	.ie-browser .block-grid.twelve-up .col,'
str+='	[owa] .block-grid.twelve-up .col {'
str+='		width: 50px !important;'
str+='	}'
str+='</style>'
str+='<style id="media-query" type="text/css">'
str+='@media only screen and (min-width: 690px) {'
str+='	.block-grid {'
str+='		width: 670px !important;'
str+='	}'
str+=''
str+='	.block-grid .col {'
str+='		vertical-align: top;'
str+='	}'
str+=''
str+='	.block-grid .col.num12 {'
str+='		width: 670px !important;'
str+='	}'
str+=''
str+='	.block-grid.mixed-two-up .col.num3 {'
str+='		width: 165px !important;'
str+='	}'
str+=''
str+='	.block-grid.mixed-two-up .col.num4 {'
str+='		width: 220px !important;'
str+='	}'
str+=''
str+='	.block-grid.mixed-two-up .col.num8 {'
str+='		width: 440px !important;'
str+='	}'
str+=''
str+='	.block-grid.mixed-two-up .col.num9 {'
str+='		width: 495px !important;'
str+='	}'
str+=''
str+='	.block-grid.two-up .col {'
str+='		width: 335px !important;'
str+='	}'
str+=''
str+='	.block-grid.three-up .col {'
str+='		width: 223px !important;'
str+='	}'
str+=''
str+='	.block-grid.four-up .col {'
str+='		width: 167px !important;'
str+='	}'
str+=''
str+='	.block-grid.five-up .col {'
str+='		width: 134px !important;'
str+='	}'
str+=''
str+='	.block-grid.six-up .col {'
str+='		width: 111px !important;'
str+='	}'
str+=''
str+='	.block-grid.seven-up .col {'
str+='		width: 95px !important;'
str+='	}'
str+=''
str+='	.block-grid.eight-up .col {'
str+='		width: 83px !important;'
str+='	}'
str+=''
str+='	.block-grid.nine-up .col {'
str+='		width: 74px !important;'
str+='	}'
str+=''
str+='	.block-grid.ten-up .col {'
str+='		width: 67px !important;'
str+='	}'
str+=''
str+='	.block-grid.eleven-up .col {'
str+='		width: 60px !important;'
str+='	}'
str+=''
str+='	.block-grid.twelve-up .col {'
str+='		width: 55px !important;'
str+='	}'
str+='}'
str+=''
str+='@media (max-width: 690px) {'
str+=''
str+='	.block-grid,'
str+='	.col {'
str+='		min-width: 320px !important;'
str+='		max-width: 100% !important;'
str+='		display: block !important;'
str+='	}'
str+=''
str+='	.block-grid {'
str+='		width: 100% !important;'
str+='	}'
str+=''
str+='	.col {'
str+='		width: 100% !important;'
str+='	}'
str+=''
str+='	.col>div {'
str+='		margin: 0 auto;'
str+='	}'
str+=''
str+='	img.fullwidth,'
str+='	img.fullwidthonmobile {'
str+='		max-width: 100% !important;'
str+='	}'
str+=''
str+='	.no-stack .col {'
str+='		min-width: 0 !important;'
str+='		display: table-cell !important;'
str+='	}'
str+=''
str+='	.no-stack.two-up .col {'
str+='		width: 50% !important;'
str+='	}'
str+=''
str+='	.no-stack .col.num4 {'
str+='		width: 33% !important;'
str+='	}'
str+=''
str+='	.no-stack .col.num8 {'
str+='		width: 66% !important;'
str+='	}'
str+=''
str+='	.no-stack .col.num4 {'
str+='		width: 33% !important;'
str+='	}'
str+=''
str+='	.no-stack .col.num3 {'
str+='		width: 25% !important;'
str+='	}'
str+=''
str+='	.no-stack .col.num6 {'
str+='		width: 50% !important;'
str+='	}'
str+=''
str+='	.no-stack .col.num9 {'
str+='		width: 75% !important;'
str+='	}'
str+=''
str+='	.video-block {'
str+='		max-width: none !important;'
str+='	}'
str+=''
str+='	.mobile_hide {'
str+='		min-height: 0px;'
str+='		max-height: 0px;'
str+='		max-width: 0px;'
str+='		display: none;'
str+='		overflow: hidden;'
str+='		font-size: 0px;'
str+='	}'
str+=''
str+='	.desktop_hide {'
str+='		display: block !important;'
str+='		max-height: none !important;'
str+='	}'
str+='}'
str+='</style>'
str+='</head>'
str+='<body class="clean-body" style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #e8e8e8;">'
str+='	<style id="media-query-bodytag" type="text/css">'
str+='	@media (max-width: 690px) {'
str+='		.block-grid {'
str+='			min-width: 320px!important;'
str+='			max-width: 100%!important;'
str+='			width: 100%!important;'
str+='			display: block!important;'
str+='		}'
str+='		.col {'
str+='			min-width: 320px!important;'
str+='			max-width: 100%!important;'
str+='			width: 100%!important;'
str+='			display: block!important;'
str+='		}'
str+='		.col > div {'
str+='			margin: 0 auto;'
str+='		}'
str+='		img.fullwidth {'
str+='			max-width: 100%!important;'
str+='			height: auto!important;'
str+='		}'
str+='		img.fullwidthonmobile {'
str+='			max-width: 100%!important;'
str+='			height: auto!important;'
str+='		}'
str+='		.no-stack .col {'
str+='			min-width: 0!important;'
str+='			display: table-cell!important;'
str+='		}'
str+='		.no-stack.two-up .col {'
str+='			width: 50%!important;'
str+='		}'
str+='		.no-stack.mixed-two-up .col.num4 {'
str+='			width: 33%!important;'
str+='		}'
str+='		.no-stack.mixed-two-up .col.num8 {'
str+='			width: 66%!important;'
str+='		}'
str+='		.no-stack.three-up .col.num4 {'
str+='			width: 33%!important'
str+='		}'
str+='		.no-stack.four-up .col.num3 {'
str+='			width: 25%!important'
str+='		}'
str+='	}'
str+='</style>'
str+='<table bgcolor="#e8e8e8" cellpadding="0" cellspacing="0" class="nl-container" role="presentation" style="table-layout: fixed; vertical-align: top; min-width: 320px; margin: 0 auto; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #e8e8e8; width: 100%;" valign="top" width="100%">'
str+='	<tbody>'
str+='		<tr style="vertical-align: top;" valign="top">'
str+='			<td style="word-break: break-word; vertical-align: top; border-collapse: collapse;" valign="top">'
str+='				<div style="background-color:#a6a6a6;">'
str+='					<div class="block-grid two-up no-stack" style="margin: 0 auto; min-width: 320px; max-width: 670px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;;">'
str+='						<div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;">'
str+='							<div class="col num6" style="min-width: 320px; max-width: 335px; display: table-cell; vertical-align: top;;">'
str+='								<div style="width:100% !important;">'
str+='									<div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 15px; padding-left: 15px;">'
str+='										<div align="left" class="img-container left fixedwidth" style="padding-right: 25px;padding-left: 0px;">'
str+='											<div style="font-size:1px;line-height:25px"> </div><img alt="image" border="0" class="left fixedwidth" src="https://s3.amazonaws.com/movies-bucket-admin/logo.png" style="outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; clear: both; border: 0; height: auto; float: none; width: 100%; max-width: 196px; display: block;" title="image" width="196"/>'
str+='											<div style="font-size:1px;line-height:25px"> </div>'
str+='										</div>'
str+='									</div>'
str+='								</div>'
str+='							</div>'
str+='							<div class="col num6" style="min-width: 320px; max-width: 335px; display: table-cell; vertical-align: top;;">'
str+='								<div style="width:100% !important;">'
str+='									<div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;">'
str+='										<table border="0" cellpadding="0" cellspacing="0" class="divider" role="presentation" style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" valign="top" width="100%">'
str+='											<tbody>'
str+='												<tr style="vertical-align: top;" valign="top">'
str+='													<td class="divider_inner" style="word-break: break-word; vertical-align: top; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top: 35px; padding-right: 35px; padding-bottom: 35px; padding-left: 35px; border-collapse: collapse;" valign="top">'
str+='														<table align="center" border="0" cellpadding="0" cellspacing="0" class="divider_content" height="0" role="presentation" style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; border-top: 0px solid transparent; height: 0px;" valign="top" width="100%">'
str+='															<tbody>'
str+='																<tr style="vertical-align: top;" valign="top">'
str+='																	<td height="0" style="word-break: break-word; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; border-collapse: collapse;" valign="top"><span></span></td>'
str+='																</tr>'
str+='															</tbody>'
str+='														</table>'
str+='													</td>'
str+='												</tr>'
str+='											</tbody>'
str+='										</table>'
str+='									</div>'
str+='								</div>'
str+='							</div>'
str+='						</div>'
str+='					</div>'
str+='				</div>'
str+='				<div style="background-image:url(https://s3.amazonaws.com/movies-bucket-admin/bg_hero_1.gif);background-position:top center;background-repeat:no-repeat;background-color:transparent;">'
str+='					<div class="block-grid" style="margin: 0 auto; min-width: 320px; max-width: 670px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;;">'
str+='						<div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;">'
str+='							<div class="col num12" style="min-width: 320px; max-width: 670px; display: table-cell; vertical-align: top;;">'
str+='								<div style="width:100% !important;">'
str+='									<!--[if (!mso)&(!ie)]><!-->'
str+='									<div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:60px; padding-bottom:60px; padding-right: 0px; padding-left: 0px;">'
str+='										<div style="color:#ee2337;font-family:oswald, arial, helvetica neue, helvetica, sans-serif;line-height:120%;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;">'
str+='											<div style="font-size: 12px; line-height: 14px; font-family: oswald, arial, helvetica neue, helvetica, sans-serif; color: #ee2337;">'
str+='												<p style="font-size: 14px; line-height: 50px; margin: 0;"><span style="font-size: 42px;">xin chào</span></p>'
str+='											</div>'
str+='										</div>'
str+='										<div style="color:#555555;font-family:roboto, tahoma, verdana, segoe, sans-serif;line-height:150%;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;">'
str+='											<div style="font-size: 12px; line-height: 18px; font-family: roboto, tahoma, verdana, segoe, sans-serif; color: #555555;">'
str+='												<p style="font-size: 14px; line-height: 30px; margin: 0;"><span style="font-size: 20px; background-color: #ffffff;"> htlfilm xin trân trọng giới thiệt loạt phim mới nóng hổi mà htlfilm vừa mới cập nhật. bạn sẽ thích đấy.. hãy là những người đầu tiên quan tâm nào ^^ !! </span><span style="font-size: 20px; line-height: 30px; background-color: #ffffff;"> </span></p>'
str+='											</div>'
str+='										</div>'
str+='										<a href="http://htlfilm.us-east-1.elasticbeanstalk.com">'
str+='											<div align="left" class="button-container" style="padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;">'
str+='												<div style="text-decoration:none;display:inline-block;color:#ffffff;background-color:#ee2337;border-radius:4px;-webkit-border-radius:4px;-moz-border-radius:4px;width:auto; width:auto;;border-top:3px solid #ee2337;border-right:3px solid #ee2337;border-bottom:3px solid #ee2337;border-left:3px solid #ee2337;padding-top:5px;padding-bottom:5px;font-family:oswald, arial, helvetica neue, helvetica, sans-serif;text-align:center;mso-border-alt:none;word-break:keep-all;"><span style="padding-left:30px;padding-right:30px;font-size:22px;display:inline-block;">'
str+='													<span style="font-size: 16px; line-height: 32px;"><span style="font-size: 22px; line-height: 44px;"><strong>truy cập ngay ⟶</strong></span></span>'
str+='												</span></div>'
str+='											</div>'
str+='										</a>'
str+='									</div>'
str+='								</div>'
str+='							</div>'
str+='						</div>'
str+='					</div>'
str+='				</div>'
str+='				<div style="background-color:transparent;">'
str+='					<div class="block-grid" style="margin: 0 auto; min-width: 320px; max-width: 670px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #ffffff;;">'
str+='						<div style="border-collapse: collapse;display: table;width: 100%;background-color:#ffffff;">'
str+='							<div class="col num12" style="min-width: 320px; max-width: 670px; display: table-cell; vertical-align: top;;">'
str+='								<div style="width:100% !important;">'
str+='									<div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;">'
str+='										<table border="0" cellpadding="0" cellspacing="0" class="divider" role="presentation" style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" valign="top" width="100%">'
str+='											<tbody>'
str+='												<tr style="vertical-align: top;" valign="top">'
str+='													<td class="divider_inner" style="word-break: break-word; vertical-align: top; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top: 5px; padding-right: 5px; padding-bottom: 5px; padding-left: 5px; border-collapse: collapse;" valign="top">'
str+='														<table align="center" border="0" cellpadding="0" cellspacing="0" class="divider_content" height="0" role="presentation" style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; border-top: 0px solid transparent; height: 0px;" valign="top" width="100%">'
str+='															<tbody>'
str+='																<tr style="vertical-align: top;" valign="top">'
str+='																	<td height="0" style="word-break: break-word; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; border-collapse: collapse;" valign="top"><span></span></td>'
str+='																</tr>'
str+='															</tbody>'
str+='														</table>'
str+='													</td>'
str+='												</tr>'
str+='											</tbody>'
str+='										</table>'
str+='									</div>'
str+='								</div>'
str+='							</div>'
str+='						</div>'
str+='					</div>'
str+='				</div>'
str+='				<div style="background-color:#f8f8f8;">'
str+='					<div class="block-grid" style="margin: 0 auto; min-width: 320px; max-width: 670px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #ffffff;;">'
str+='						<div style="border-collapse: collapse;display: table;width: 100%;background-color:#ffffff;">'
str+='							<div class="col num12" style="min-width: 320px; max-width: 670px; display: table-cell; vertical-align: top;;">'
str+='								<div style="width:100% !important;">'
str+='									<!--[if (!mso)&(!ie)]><!-->'
str+='									<div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:10px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;">'
str+='										<div style="color:#07a3ff;font-family:oswald, arial, helvetica neue, helvetica, sans-serif;line-height:120%;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;">'
str+='											<div style="line-height: 14px; font-size: 12px; font-family: oswald, arial, helvetica neue, helvetica, sans-serif; color: #07a3ff;">'
str+='												<p style="line-height: 69px; font-size: 12px; text-align: center; margin: 0;"><span style="font-size: 58px;"><em><span style="line-height: 69px; font-size: 58px;"><strong><span style="line-height: 69px; font-size: 58px;">phim mới hôm nay</span></strong></span></em></span></p>'
str+='											</div>'
str+='										</div>'
str+='									</div>'
str+='								</div>'
str+='							</div>'
str+='						</div>'
str+='					</div>'
str+='				</div>'
//END HEADER MAIL
//HEADER FOOTER MAIL
var ftr="";
ftr+=''
ftr+='				<div style="background-color:transparent;">'
ftr+='					<div class="block-grid" style="margin: 0 auto; min-width: 320px; max-width: 670px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #ffffff;;">'
ftr+='						<div style="border-collapse: collapse;display: table;width: 100%;background-color:#ffffff;">'
ftr+=''
ftr+='									<div class="col num12" style="min-width: 320px; max-width: 670px; display: table-cell; vertical-align: top;;">'
ftr+='										<div style="width:100% !important;">'
ftr+='										'
ftr+='											<div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;">'
ftr+='												<!--<![endif]-->'
ftr+='												<table border="0" cellpadding="0" cellspacing="0" class="divider" role="presentation" style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" valign="top" width="100%">'
ftr+='													<tbody>'
ftr+='														<tr style="vertical-align: top;" valign="top">'
ftr+='															<td class="divider_inner" style="word-break: break-word; vertical-align: top; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top: 5px; padding-right: 5px; padding-bottom: 5px; padding-left: 5px; border-collapse: collapse;" valign="top">'
ftr+='																<table align="center" border="0" cellpadding="0" cellspacing="0" class="divider_content" height="0" role="presentation" style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; border-top: 0px solid transparent; height: 0px;" valign="top" width="100%">'
ftr+='																	<tbody>'
ftr+='																		<tr style="vertical-align: top;" valign="top">'
ftr+='																			<td height="0" style="word-break: break-word; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; border-collapse: collapse;" valign="top"><span></span></td>'
ftr+='																		</tr>'
ftr+='																	</tbody>'
ftr+='																</table>'
ftr+='															</td>'
ftr+='														</tr>'
ftr+='													</tbody>'
ftr+='												</table>'
ftr+='											'
ftr+='											</div>'
ftr+='											'
ftr+='										</div>'
ftr+='									</div>'
ftr+='									'
ftr+='								</div>'
ftr+='							</div>'
ftr+='						</div>'
ftr+='						<div style="background-image:url(https://s3.amazonaws.com/movies-bucket-admin/footter.png);background-position:top center;background-repeat:no-repeat;background-color:transparent;">'
ftr+='							<div class="block-grid" style="margin: 0 auto; min-width: 320px; max-width: 670px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;;">'
ftr+='								<div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;">'
ftr+='								'
ftr+='											<div class="col num12" style="min-width: 320px; max-width: 670px; display: table-cell; vertical-align: top;;">'
ftr+='												<div style="width:100% !important;">'
ftr+='													<!--[if (!mso)&(!ie)]><!-->'
ftr+='													<div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:60px; padding-bottom:60px; padding-right: 0px; padding-left: 0px;">'
ftr+='														'
ftr+='															<div style="color:#4fd10b;font-family:ubuntu, tahoma, verdana, segoe, sans-serif;line-height:120%;padding-top:60px;padding-right:35px;padding-bottom:60px;padding-left:60px;">'
ftr+='																<div style="font-size: 12px; line-height: 14px; font-family: ubuntu, tahoma, verdana, segoe, sans-serif; color: #4fd10b;">'
ftr+='																	<p style="font-size: 14px; line-height: 16px; text-align: left; margin: 0;"> </p>'
ftr+='																</div>'
ftr+='															</div>'
ftr+='															'
ftr+='																<div style="color:#f91eff;font-family:montserrat, trebuchet ms, lucida grande, lucida sans unicode, lucida sans, tahoma, sans-serif;line-height:120%;padding-top:60px;padding-right:10px;padding-bottom:0px;padding-left:60px;">'
ftr+='																	<div style="font-family: montserrat, trebuchet ms, lucida grande, lucida sans unicode, lucida sans, tahoma, sans-serif; font-size: 12px; line-height: 14px; color: #f91eff;">'
ftr+='																		<p dir="ltr" style="font-size: 14px; line-height: 16px; margin: 0;"><strong><span style="font-size: 24px; line-height: 28px;">htlfilm luôn đồng hành cùng bạn <span style="background-color: #ffffff; font-size: 24px; line-height: 28px;">htlfilm ↷ </span></span></strong></p>'
ftr+='																	</div>'
ftr+='																</div>'
ftr+='																'
ftr+='																<table cellpadding="0" cellspacing="0" class="social_icons" role="presentation" style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;" valign="top" width="100%">'
ftr+='																	<tbody>'
ftr+='																		<tr style="vertical-align: top;" valign="top">'
ftr+='																			<td style="word-break: break-word; vertical-align: top; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; padding-left: 10px; border-collapse: collapse;" valign="top">'
ftr+='																				<table activate="activate" align="center" alignment="alignment" cellpadding="0" cellspacing="0" class="social_table" role="presentation" style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: undefined; mso-table-tspace: 0; mso-table-rspace: 0; mso-table-bspace: 0; mso-table-lspace: 0;" to="to" valign="top">'
ftr+='																					<tbody>'
ftr+='																						<tr align="center" style="vertical-align: top; display: inline-block; text-align: center;" valign="top">'
ftr+='																							<td style="word-break: break-word; vertical-align: top; padding-bottom: 5px; padding-right: 3px; padding-left: 3px; border-collapse: collapse;" valign="top"><a href="https://www.facebook.com/truong.lam.7587" target="_blank"><img alt="facebook" height="32" src="https://s3.amazonaws.com/movies-bucket-admin/facebookblue%402x.png" style="outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; clear: both; height: auto; float: none; border: none; display: block;" title="facebook" width="32"/></a></td>'
ftr+='																							<td style="word-break: break-word; vertical-align: top; padding-bottom: 5px; padding-right: 3px; padding-left: 3px; border-collapse: collapse;" valign="top"><a href="https://twitter.com/" target="_blank"><img alt="twitter" height="32" src="https://s3.amazonaws.com/movies-bucket-admin/twitter%402x.png" style="outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; clear: both; height: auto; float: none; border: none; display: block;" title="twitter" width="32"/></a></td>'
ftr+='																							<td style="word-break: break-word; vertical-align: top; padding-bottom: 5px; padding-right: 3px; padding-left: 3px; border-collapse: collapse;" valign="top"><a href="https://www.linkedin.com/" target="_blank"><img alt="linkedin" height="32" src="https://s3.amazonaws.com/movies-bucket-admin/linkedin%402x.png" style="outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; clear: both; height: auto; float: none; border: none; display: block;" title="linkedin" width="32"/></a></td>'
ftr+='																							<td style="word-break: break-word; vertical-align: top; padding-bottom: 5px; padding-right: 3px; padding-left: 3px; border-collapse: collapse;" valign="top"><a href="http://htlfilm.us-east-1.elasticbeanstalk.com" target="_blank"><img alt="htlfilm" height="32" src="https://s3.amazonaws.com/movies-bucket-admin/logo.png" style="outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; clear: both; height: auto; float: none; border: none; display: block;" title="htlfilm" width="132"/></a></td>'
ftr+='																						</tr>'
ftr+='																					</tbody>'
ftr+='																				</table>'
ftr+='																			</td>'
ftr+='																		</tr>'
ftr+='																	</tbody>'
ftr+='																</table>'
ftr+='																'
ftr+='															</div>'
ftr+='															'
ftr+='														</div>'
ftr+='													</div>'
ftr+='													'
ftr+='												</div>'
ftr+='											</div>'
ftr+='										</div>'

//END HEADER FOOTER MAIL
        // MOVIE 1-2===============
        var moiveitem_1_2 = '<div style="background-color:#f8f8f8;"><div class="block-grid two-up" style="margin: 0 auto; min-width: 320px; max-width: 670px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #ffffff;;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:#ffffff;"><!-- Movie-1 --><div class="col num6" style="min-width: 320px; max-width: 335px; display: table-cell; vertical-align: top;;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:15px; padding-bottom:15px; padding-right: 15px; padding-left: 15px;"><div align="center" class="img-container center autowidth fullwidth"><a href="http://htlfilm.us-east-1.elasticbeanstalk.com/detail-movie?id=' + i.idmovies[0] + '"><img align="center" alt="image" border="0" class="center autowidth fullwidth" src="' + i.urlimages[0] + '" style="outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; clear: both; border: 0; height: auto; float: none; width: 100%; max-width: 305px; display: block;" title="image" width="305"/></a></div><div style="color:#ee2337;font-family:droid serif, georgia, times, times new roman, serif;line-height:120%;padding-top:20px;padding-right:10px;padding-bottom:0px;padding-left:10px;"><div style="font-size: 12px; line-height: 14px; font-family: droid serif, georgia, times, times new roman, serif; color: #ee2337;"><p style="font-size: 14px; line-height: 21px; margin: 0;"><span style="font-size: 18px;">'
        moiveitem_1_2 += '<strong><a href="http://htlfilm.us-east-1.elasticbeanstalk.com/detail-movie?id=' + i.idmovies[0] + '">' + i.titles[0] + '</a></strong></span></p></div></div><div style="color:#555555;font-family:droid serif, georgia, times, times new roman, serif;line-height:150%;padding-top:5px;padding-right:10px;padding-bottom:5px;padding-left:10px;"><div style="font-size: 12px; line-height: 18px; font-family: droid serif, georgia, times, times new roman, serif; color: #555555;"><p style="font-size: 14px; line-height: 21px; margin: 0;">' + i.contents[0] + '</p></div></div></div></div></div><!--End Movie-1 --><!-- Movie-2 --><div class="col num6" style="min-width: 320px; max-width: 335px; display: table-cell; vertical-align: top;;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:15px; padding-bottom:15px; padding-right: 15px; padding-left: 15px;"><div align="center" class="img-container center autowidth fullwidth"><a href="http://htlfilm.us-east-1.elasticbeanstalk.com/detail-movie?id=' + i.idmovies[1] + '"><img align="center" alt="image" border="0" class="center autowidth fullwidth" src="' + i.urlimages[1] + '" tstyle="outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; clear: both; border: 0; height: auto; float: none; width: 100%; max-width: 305px; display: block;" title="image" width="305"/></a></div><div style="color:#ee2337;font-family:droid serif, georgia, times, times new roman, serif;line-height:120%;padding-top:20px;padding-right:10px;padding-bottom:0px;padding-left:10px;"><div style="font-size: 12px; line-height: 14px; font-family: droid serif, georgia, times, times new roman, serif; color: #ee2337;"><p style="font-size: 14px; line-height: 21px; margin: 0;"><span style="font-size: 18px;"><strong><a href="http://htlfilm.us-east-1.elasticbeanstalk.com/detail-movie?id=' + i.idmovies[1] + '">' + i.titles[1] + '</a></strong></span></p></div></div><div style="color:#555555;font-family:droid serif, georgia, times, times new roman, serif;line-height:150%;padding-top:5px;padding-right:10px;padding-bottom:5px;padding-left:10px;"><div style="font-size: 12px; line-height: 18px; font-family: droid serif, georgia, times, times new roman, serif; color: #555555;"><p style="font-size: 14px; line-height: 21px; margin: 0;">' + i.contents[1] + '</p></div></div></div></div></div></div></div></div>'
        // END MOVIE 1-2==============
        // MOVIE 3-4===============
        var moiveitem_3_4 = '<div style="background-color:#f8f8f8;"><div class="block-grid two-up" style="margin: 0 auto; min-width: 320px; max-width: 670px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #ffffff;;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:#ffffff;"><!-- Movie-1 --><div class="col num6" style="min-width: 320px; max-width: 335px; display: table-cell; vertical-align: top;;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:15px; padding-bottom:15px; padding-right: 15px; padding-left: 15px;"><div align="center" class="img-container center autowidth fullwidth"><a href="http://htlfilm.us-east-1.elasticbeanstalk.com/detail-movie?id=' + i.idmovies[2] + '"><img align="center" alt="image" border="0" class="center autowidth fullwidth" src="' + i.urlimages[2] + '" style="outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; clear: both; border: 0; height: auto; float: none; width: 100%; max-width: 305px; display: block;" title="image" width="305"/></a></div><div style="color:#ee2337;font-family:droid serif, georgia, times, times new roman, serif;line-height:120%;padding-top:20px;padding-right:10px;padding-bottom:0px;padding-left:10px;"><div style="font-size: 12px; line-height: 14px; font-family: droid serif, georgia, times, times new roman, serif; color: #ee2337;"><p style="font-size: 14px; line-height: 21px; margin: 0;"><span style="font-size: 18px;">'
        moiveitem_3_4 += '<strong><a href="http://htlfilm.us-east-1.elasticbeanstalk.com/detail-movie?id=' + i.idmovies[2] + '">' + i.titles[2] + '</a></strong></span></p></div></div><div style="color:#555555;font-family:droid serif, georgia, times, times new roman, serif;line-height:150%;padding-top:5px;padding-right:10px;padding-bottom:5px;padding-left:10px;"><div style="font-size: 12px; line-height: 18px; font-family: droid serif, georgia, times, times new roman, serif; color: #555555;"><p style="font-size: 14px; line-height: 21px; margin: 0;">' + i.contents[2] + '</p></div></div></div></div></div><!--End Movie-1 --><!-- Movie-2 --><div class="col num6" style="min-width: 320px; max-width: 335px; display: table-cell; vertical-align: top;;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:15px; padding-bottom:15px; padding-right: 15px; padding-left: 15px;"><div align="center" class="img-container center autowidth fullwidth"><a href="http://htlfilm.us-east-1.elasticbeanstalk.com/detail-movie?id=' + i.idmovies[3] + '"><img align="center" alt="image" border="0" class="center autowidth fullwidth" src="' + i.urlimages[3] + '" tstyle="outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; clear: both; border: 0; height: auto; float: none; width: 100%; max-width: 305px; display: block;" title="image" width="305"/></a></div><div style="color:#ee2337;font-family:droid serif, georgia, times, times new roman, serif;line-height:120%;padding-top:20px;padding-right:10px;padding-bottom:0px;padding-left:10px;"><div style="font-size: 12px; line-height: 14px; font-family: droid serif, georgia, times, times new roman, serif; color: #ee2337;"><p style="font-size: 14px; line-height: 21px; margin: 0;"><span style="font-size: 18px;"><strong><a href="http://htlfilm.us-east-1.elasticbeanstalk.com/detail-movie?id=' + i.idmovies[3] + '">' + i.titles[3] + '</a></strong></span></p></div></div><div style="color:#555555;font-family:droid serif, georgia, times, times new roman, serif;line-height:150%;padding-top:5px;padding-right:10px;padding-bottom:5px;padding-left:10px;"><div style="font-size: 12px; line-height: 18px; font-family: droid serif, georgia, times, times new roman, serif; color: #555555;"><p style="font-size: 14px; line-height: 21px; margin: 0;">' + i.contents[3] + '</p></div></div></div></div></div></div></div></div>'
        // END MOVIE 3-4==============

        // MOVIE 5-6===============
        var moiveitem_5_6 = '<div style="background-color:#f8f8f8;"><div class="block-grid two-up" style="margin: 0 auto; min-width: 320px; max-width: 670px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #ffffff;;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:#ffffff;"><!-- Movie-1 --><div class="col num6" style="min-width: 320px; max-width: 335px; display: table-cell; vertical-align: top;;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:15px; padding-bottom:15px; padding-right: 15px; padding-left: 15px;"><div align="center" class="img-container center autowidth fullwidth"><a href="http://htlfilm.us-east-1.elasticbeanstalk.com/detail-movie?id=' + i.idmovies[4] + '"><img align="center" alt="image" border="0" class="center autowidth fullwidth" src="' + i.urlimages[4] + '" style="outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; clear: both; border: 0; height: auto; float: none; width: 100%; max-width: 305px; display: block;" title="image" width="305"/></a></div><div style="color:#ee2337;font-family:droid serif, georgia, times, times new roman, serif;line-height:120%;padding-top:20px;padding-right:10px;padding-bottom:0px;padding-left:10px;"><div style="font-size: 12px; line-height: 14px; font-family: droid serif, georgia, times, times new roman, serif; color: #ee2337;"><p style="font-size: 14px; line-height: 21px; margin: 0;"><span style="font-size: 18px;">'
        moiveitem_5_6 += '<strong><a href="http://htlfilm.us-east-1.elasticbeanstalk.com/detail-movie?id=' + i.idmovies[4] + '">' + i.titles[4] + '</a></strong></span></p></div></div><div style="color:#555555;font-family:droid serif, georgia, times, times new roman, serif;line-height:150%;padding-top:5px;padding-right:10px;padding-bottom:5px;padding-left:10px;"><div style="font-size: 12px; line-height: 18px; font-family: droid serif, georgia, times, times new roman, serif; color: #555555;"><p style="font-size: 14px; line-height: 21px; margin: 0;">' + i.contents[4] + '</p></div></div></div></div></div><!--End Movie-1 --><!-- Movie-2 --><div class="col num6" style="min-width: 320px; max-width: 335px; display: table-cell; vertical-align: top;;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:15px; padding-bottom:15px; padding-right: 15px; padding-left: 15px;"><div align="center" class="img-container center autowidth fullwidth"><a href="http://htlfilm.us-east-1.elasticbeanstalk.com/detail-movie?id=' + i.idmovies[5] + '"><img align="center" alt="image" border="0" class="center autowidth fullwidth" src="' + i.urlimages[5] + '" tstyle="outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; clear: both; border: 0; height: auto; float: none; width: 100%; max-width: 305px; display: block;" title="image" width="305"/></a></div><div style="color:#ee2337;font-family:droid serif, georgia, times, times new roman, serif;line-height:120%;padding-top:20px;padding-right:10px;padding-bottom:0px;padding-left:10px;"><div style="font-size: 12px; line-height: 14px; font-family: droid serif, georgia, times, times new roman, serif; color: #ee2337;"><p style="font-size: 14px; line-height: 21px; margin: 0;"><span style="font-size: 18px;"><strong><a href="http://htlfilm.us-east-1.elasticbeanstalk.com/detail-movie?id=' + i.idmovies[5] + '">' + i.titles[5] + '</a></strong></span></p></div></div><div style="color:#555555;font-family:droid serif, georgia, times, times new roman, serif;line-height:150%;padding-top:5px;padding-right:10px;padding-bottom:5px;padding-left:10px;"><div style="font-size: 12px; line-height: 18px; font-family: droid serif, georgia, times, times new roman, serif; color: #555555;"><p style="font-size: 14px; line-height: 21px; margin: 0;">' + i.contents[5] + '</p></div></div></div></div></div></div></div></div>'
        // END MOVIE 5-6==============
        var now = new Date();
        var thistime = now.getDate() + "-" + (parseInt(now.getMonth()) + 1) + "-" + now.getFullYear();
        // FOOTER
        var endfooter = '<div style="background-color:#555555;"><div class="block-grid" style="margin: 0 auto; min-width: 320px; max-width: 670px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"><div class="col num12" style="min-width: 320px; max-width: 670px; display: table-cell; vertical-align: top;;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:30px; padding-bottom:20px; padding-right: 0px; padding-left: 0px;"><div style="color:#ffffff;font-family: droid serif , georgia, times,  times new roman , serif;line-height:150%;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;"><div style="font-size: 12px; line-height: 18px; font-family:  droid serif , georgia, times,  times new roman , serif; color: #ffffff;"><p style="font-size: 14px; line-height: 21px; text-align: center; margin: 0;"><strong>HTLFilm || ' + thistime + '</strong></p></div></div></div></div></div></div></div></td></tr></tbody></table></body></html>'
        // END FOOTER
        //Call function Sendmail from route notification     
        sendMail(str + moiveitem_1_2 + moiveitem_3_4 + moiveitem_5_6 + ftr + endfooter)

      })
    }
  });
}

//Update cout is 0 for notification
function UpdateEmty() {
  var params = {
    TableName: "Notification",
    Key: {
      id: 'notification'
    },
    UpdateExpression:
      "set #a=:a, #b=:b, #c=:c, #d=:d, #count=:val",
    ExpressionAttributeNames: {
      "#a": "idmovies",
      "#b": "titles",
      "#c": "urlimages",
      "#d": "contents",
      "#count": "count"
    },
    ExpressionAttributeValues: {
      ":a": [],
      ":b": [],
      ":c": [],
      ":d": [],
      ":val": 0
    },
    ReturnValues: "UPDATED_NEW"
  };
  docClient.update(params, function (err, data1) {
    if (err) {
      console.error(
        "Unable to update item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      return true;
    }
  })

}
function sendMail(contentmail) {
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
      var isEmail = "";
      var tomail = "";
      data.Items[0].emails.forEach((i, index) => {
        if (index == 0) {
          tomail += i;
        }
        else if (index == data.Items[0].emails.length) {
          isEmail += i;
        }
        else {
          isEmail += i + ",";
        }
      });
      var mailOptions = {
        from: 'lozodo831@gmail.com',
        to: tomail,
        bcc: isEmail,
        subject: 'HTLFilm Xin Chào',
        html: contentmail
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          UpdateEmty();
          console.log('Email sent: ' + info.response);
        }
      });
    }
  })
}

//Update CloudSearch
function UpdateCloudSearch(idmovie) {
  var csDomain = 'search-searchdata-rithptdvuzk5yuqltjkrbr4lje.us-east-1.cloudsearch.amazonaws.com';
  var cloudsearch = new AWS.CloudSearchDomain({ endpoint: csDomain, apiVersion: '2013-01-01' });
  var param = {
    TableName: "Movies",
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: {
      ":id": idmovie
    }
  };

  docClient.query(param, function (err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      data.Items.forEach((i)=>{
      var documentsBatch = []
      var document = {}
      document.id = i.id;
      document.type = 'add';
      document.fields = { 
        title: i.title,
            actor: i.info.actor,
            country: i.info.country,
            producer:i.info.producer,
            posterimage: i.info.posterimage,
            content:i.info.content,
            movietype:i.info.movietype,
            publicationdate:i.info.publicationdate,
            director:i.info.director
        };
      documentsBatch.push(document);
      var params = { contentType: 'application/json', documents: JSON.stringify(documentsBatch) };
      cloudsearch.uploadDocuments(params, function (err, data) {
        if (err) {
          console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
          //context.success('document uploaded successfully');
          console.log("success cloudsearch");
        }
      });
      })
    }
  });
}
//Delete CloudSearch
function DeleteCloudSearch(idmovie) {
  var csDomain = 'search-searchdata-rithptdvuzk5yuqltjkrbr4lje.us-east-1.cloudsearch.amazonaws.com';
  var cloudsearch = new AWS.CloudSearchDomain({ endpoint: csDomain, apiVersion: '2013-01-01' });
  var param = {
    TableName: "Movies",
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: {
      ":id": idmovie
    }
  };

  docClient.query(param, function (err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      data.Items.forEach((i)=>{
      var documentsBatch = []
      var document = {}
      document.id = i.id;
      document.type = 'delete';
      document.fields = { 
        title: i.title,
            actor: i.info.actor,
            country: i.info.country,
            producer:i.info.producer,
            posterimage: i.info.posterimage,
            content:i.info.content,
            movietype:i.info.movietype,
            publicationdate:i.info.publicationdate,
            director:i.info.director
        };
      documentsBatch.push(document);
      var params = { contentType: 'application/json', documents: JSON.stringify(documentsBatch) };
      cloudsearch.uploadDocuments(params, function (err, data) {
        if (err) {
          console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
          //context.success('document uploaded successfully');
          console.log("success cloudsearch");
        }
      });
      })
    }
  });
}
module.exports = router;
