var express = require("express");
var router = express.Router();
var AWS = require("aws-sdk");
var uuid4 = require("uuid4");
var dateFormat = require("dateformat");
var multer = require("multer");
var multerS3 = require("multer-s3");
var upload = multer({ dest: "uploads/" });
var dynamoDbConfig = require("../config/dynamodb-config");
var deleteS3 = require('s3fs');
var moment = require('moment');

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
    if (req.session.passport.user.role < role) {
      return res.redirect('/error-not-role');
    } else {
      return true;
    }
  }
}
// ======================================================================================

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
  var titletab="Create Movie";
  if (CheckLogin(3, res, req)) {
    return res.render("movies/createMovie-admin.ejs", { moment: moment,titletab });
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
      var fileName = file.fieldname+ "-" + Date.now() + file.originalname;
      imgname = "https://s3.amazonaws.com/movies-bucket-admin/"+fileName;
      // imgname = "https://s3-us-west-2.amazonaws.com/movies-images/" + fileName;
      cb(null, fileName); //use Date.now() for unique file keys
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
        var now = new Date();
        var initdate = dateFormat(now, "isoDate");
        var params = {
          TableName: "Movies",
          Item: {
            id: id,
            title: req.body.title[i],
            process: {
              create: {
                "creater": [req.session.passport.user.fullname, req.session.passport.user.email],
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
      var params = {
        TableName: "Movies",
        Item: {
          id: id,
          title: req.body.title,
          process: {
            create: {
              "creater": [req.session.passport.user.fullname, req.session.passport.user.email],
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
          var titletab="Update Movie";
          return res.render("../views/movies/admin-update-movie.ejs", { data, moment: moment ,titletab});
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
    var _oldtitle = req.body.oldtitle;
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
    var email = req.session.passport.user.email;
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
        var titletab="List Movies Registed";
        res.render("../views/movies/list-movie-registed.ejs", { result, moment: moment,titletab });
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
        var titletab="List Movies Waiting Register";
        res.render("../views/movies/list-movie-waiting-register-write.ejs", {
          result, role: req.session.passport.user.role, moment: moment, titletab
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
    var email = req.session.passport.user.email;
    var fullname = req.session.passport.user.fullname;
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
        var titletab="Movie Writing";
        if (data.Count > 0) {
          return res.render("../views/movies/member-writing-movie.ejs", { data, moment: moment ,titletab});
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

    var title = req.body.title;
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
        var titletab="List Movies Approve";
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
    var approver = req.session.passport.user.fullname;
    var approveremail = req.session.passport.user.email;
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
    var email = req.session.passport.user.email;
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
        var titletab="List Movies Waiting Approve";
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
    var id = req.body.id;
    var role = req.session.passport.user.role;
    if (role > 2) {
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
            img = i.info.posterimage.slice(-45);
            stt = i.stt;
          })
          if (stt == 4 || stt == 3) {

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
          else {
            s3Fs.unlink(img, function (err, data) {//Xoa img s3
              if (err) {
                throw err;
              }
              else { //Xoa dynamodb
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
        var titletab="Movie Update";
        return res.render("../views/movies/update-movie-member.ejs", { data, moment: moment,titletab });
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
        var titletab="Movie Update";
        return res.render("../views/movies/admin-update-content-movie.ejs", { data, moment: moment,titletab });
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
    var imgold = req.body.imgold.slice(-45); //bien nay luu ten cua img cu khi co su thay doi ve hinh anh.. de xoa trong s3

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
router.post("/update-content-movie-admin", upload.single("posterimage"), function (req, res, next) {
  if (CheckLogin(3)) {
    var title = req.body.title;
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
    var imgold = req.body.imgold.slice(-45); //bien nay luu ten cua img cu khi co su thay doi ve hinh anh.. de xoa trong s3

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
          ":g": title,
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
        UpdateExpression: "remove title, info.producer, info.directo, info.distance, info.publicationdate, info.actor, info.movietype, info.posterimage, info.trailer, info.content,  info.country",
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
            var params = {
              TableName: "Movies",
              Key: {
                id: id
              },
              UpdateExpression: "set title=:k, info.producer=:f, info.director=:a, info.distance=:b, info.publicationdate=:c, info.actor=:d, info.movietype=:e, info.posterimage=:g, info.trailer=:h, info.content=:i,  info.country=:l",
              ExpressionAttributeValues: {

                ":a": director,
                ":b": distance,
                ":c": publicationdate,
                ":d": actor,
                ":e": typemovie,
                ":l": country,
                ":g": posterimage,
                ":h": trailer,
                ":i": content,
                ":k": title,
                ":f": producer
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
                imgname = "";
                return res.redirect("/pageadmin");
              }
            });
          }
        });
      }
    })
  } else {
    return res.redirect('/error-not-login'); //ERR 500
  }

  //Hướng phát triển: Sau này nếu member update trong trường hợp bài viết đã được approve .Khi update lại sẽ tạo ra 1 bản mới và 1 bản củ để admin lựa chọn dữ lại bản củ hay lấy bản mới.
})
// =================Delete Create Admin====================== role =3
router.post("/delete-create-movie-admin", function (req, res, next) {
  if (CheckLogin(3, res, req)) {
    var id = req.body.id;
    var role = req.session.passport.user.role;
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
    var email = req.session.passport.user.email;
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
        var titletab="List Movies Writed";
        res.render("../views/movies/list-movie-member-writed.ejs", { data, moment: moment,titletab });
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
        var titletab="List Movies";
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
    var id_cmter = req.session.passport.user.id;
    var fullname_cmter = req.session.passport.user.fullname;
    var email_cmter = req.session.passport.user.email;
    var movie_id = req.body.id;
    var now = new Date();
    var timecmt = dateFormat(now, "shortTime");
    var daycmt = dateFormat(now, 'isoDate');
    var start = req.body.rating;
    if (!start) {
      start = 0;
    }
    var content_cmt = req.body.content_cmt;
    if(!content_cmt)
    {
      content_cmt="----no comment----"
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
    var id_liker = req.session.passport.user.id;
    var movie_id = req.body.id;
    var index=req.body.index;
    var str="remove #like["+index+"]";
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
    var id_liker = req.session.passport.user.id;
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
function deletecmt(movie_id, index) {
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
      if (data) {
        return true;
      }
      else {
        return false;
      }
    }
  });
}
router.post("/delete-cmt-movie", function (req, res, next) {
  if (CheckLogin(1, res, req)) {
    var movie_id = req.body.id;
    var index = req.body.index;
    // try {
    //   var result = await deletecmt(movie_id, index)
    //   if (result == undefined) {
    //     console.log("================= " + result)
    //     return res.send(true);
    //   }
    //   else {
    //     console.log("=================a " + result)
    //   }

    // } catch (e) {
    //   console.log("Lại lỗi nửa r huhu: " + e)
    // }
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
        console.log(JSON.stringify(data));
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

router.get("/get-key-search", function(req,res,next){
  var title=req.query.title;
  if(title=="")
  {
     return res.send(false)
  }else
  {
    
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
module.exports = router;
