var express = require("express");
var router = express.Router();
var AWS = require("aws-sdk");
var passport = require("passport");
var passportfb = require("passport-facebook").Strategy;
var ggstrategy = require("passport-google-oauth").OAuth2Strategy;
var localStratery = require("passport-local").Strategy;
var dynamoDbConfig = require("../config/dynamodb-config");
var uuid4 = require("uuid4");
var nodemailer = require('nodemailer');
var fs = require("fs")

// =========================Role===========================

// ============
// Account
// Admin=>4
// SubAdmin=>3
// Member=>2
// User=>1

// =====================End role===========================

AWS.config.update({
  region: "us-east-1",
  endpoint: "dynamodb.us-east-1.amazonaws.com"
});
AWS.config.accessKeyId = "AKIA6MYIYF6FXYX64G7Y";
AWS.config.secretAccessKey = "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";

var docClient = new AWS.DynamoDB.DocumentClient();
// =======================================================================================================
//Mail templates

// var server 	= emails.server.connect({
//   user: 'lozodo831@gmail.com',//youremail@gmail.com
//   password: '717411love',
//   host:	"Smtp.gmail.com", 
//   ssl:		true
// });
//Mail
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'lozodo831@gmail.com',//youremail@gmail.com
    pass: '717411love'
  }
});//https://myaccount.google.com/lesssecureapps
// ======================Check Login=============================
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



// ======================End Check Login=========================

// Create ID:
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
    TableName: "Accounts",
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
// ==========


// ==========Register==============
router.post("/register-account", function (req, res, next) {
  var _id = createID();
  //var _birthday=moment(req.body.birthday).format('DD/MM/YYYY');
  var params = {
    TableName: "Accounts",
    Item: {
      id: _id,
      info: {
        email: req.body.email,
        fullname: req.body.fullname,
        birthday: req.body.birthday,
        sex: req.body.sex,
        adress: req.body.adress,
        phone: req.body.phone
      },
      password: req.body.password,
      role: 1
    }
  };
  docClient.put(params, function (err, data) {
    if (err) {
      console.error(
        "Unable to update item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      return res.redirect("/");
    }
  });
});
// =======End Register=============
// ==========Register==============

router.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/", successRedirect: "/" })
);

passport.use(
  new localStratery(
    {
      usernameField: "email",
      passwordField: "password"
    },
    (email, password, done) => {
      var params = {
        TableName: "Accounts",
        FilterExpression: "info.email=:email AND password=:pass",
        ExpressionAttributeValues: {
          ":email": email,
          ":pass": password
        }
      };
      docClient.scan(params, function (err, user) {
        if (err) {
          console.error(
            "Unable to query. Error:",
            JSON.stringify(err, null, 2)
          );
        } else {
          if (user.Count > 0) {
            var sess = {};
            user.Items.forEach(function (j) {
              sess = {
                email: j.info.email,
                fullname: j.info.fullname,
                role: j.role,
                id: j.id
              };
            })
            return done(null, sess);
          } else {
            return done(null, false);
          }
        }
      });
    }
  )
);
// =======End Register=============
// =======Check Email==============
router.get("/checkemail", function (req, res, next) {
  var _email = req.query.email;
  var params = {
    TableName: "Accounts",
    FilterExpression: "info.email=:email",
    ExpressionAttributeValues: {
      ":email": _email
    }
  };

  docClient.scan(params, function (err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      if (data.Count > 0) {
        return res.send(false); //ton tai
      } else {
        return res.send(true);
      }
    }
  });
});
// =======End Check Email==========
//========Sign out session==============
router.get("/signout", function (req, res, next) {
  req.session.destroy();
  return res.end();
});

//   =========== LOGIN VS FACEBOOK===============
router.get(
  "/loginfb",
  passport.authenticate("facebook", { scope: ["email"] }),
  function (req, res, next) { }
);
router.get(
  "/loginfb/cb",
  passport.authenticate("facebook", {
    failureRedirect: "/hihi",
    successRedirect: "/"
  })
);

passport.use(
  new passportfb(
    {
      clientID: "257002525186870",
      clientSecret: "994485da2b9a29fe8c80c80bd0d3ea1f",
      callbackURL: "http://localhost:3000/account/loginfb/cb",
      profileFields: ["email", "name"]
    },
    (accessToken, refreshToken, profile, done) => {
      var _email = "";
      var _id = "FB-" + profile.id;
      profile.emails.forEach(function (i) {
        _email = i.value;
      });

      var _fullname = profile.name.givenName + " " + profile.name.familyName;
      var params = {
        TableName: "Accounts",
        KeyConditionExpression: "id=:id",
        ExpressionAttributeValues: {
          ":id": _id
        }
      };

      docClient.query(params, function (err, user) {
        if (err) {
          console.error(
            "Unable to query. Error:",
            JSON.stringify(err, null, 2)
          );
        } else {
          if (user.Count > 0) {
            return done(null, user);
          } else {
            var param = {
              TableName: "Accounts",
              Item: {
                id: _id,
                role: 1,
                info: {
                  email: _email,
                  fullname: _fullname
                }
              }
            };
            docClient.put(param, function (error, user) {
              if (err) {
                console.error(
                  "Unable to update item. Error JSON:",
                  JSON.stringify(err, null, 2)
                );
              } else {
                return done(null, user);
              }
            });
          }
        }
      });
    }
  )
);
// ==========================End Login Facebook=======================================

// ===============LOGIN VS GG=====================================================

router.get(
  "/logingg",
  passport.authenticate("google", { scope: ["profile", "email"] }),
  function (req, res, next) { }
);

router.get(
  "/logingg/cb",
  passport.authenticate("google", {
    failureRedirect: "/hihi",
    successRedirect: "/"
  })
);

passport.use(
  new ggstrategy(
    {
      // clientID:
      //   "93801717299-geo4c02sanclbtc8vulle1td1fm7ih6g.apps.googleusercontent.com",
      // clientSecret: "A47eoqVqhEepKhBKLkXhcJnH",
      // callbackURL: "http://localhost:3000/account/logingg/cb",
      // profileFields: ["email"]
      clientID:
        "863507887797-2sno32f5pgejlpl4duffenag79c0r1q2.apps.googleusercontent.com",
      clientSecret: "FNpdUg8RLdE1bl0CgeIlJ0b3",
      callbackURL: "http://htlfilm.us-east-1.elasticbeanstalk.com/account/logingg/cb",
      profileFields: ["email"]
    },
    (accessToken, refreshToken, profile, done) => {
      var _fullname = profile.name.givenName + " " + profile.name.familyName;

      var _email = "";
      var _id =profile.id;
      profile.emails.forEach(function (i) {
        _email = i.value;
      });
      var params = {
        TableName: "Accounts",
        KeyConditionExpression: "id=:id",
        ExpressionAttributeValues: {
          ":id": _id
        }
      };
      docClient.query(params, function (err, user) {
        if (err) {
          console.error(
            "Unable to query. Error:",
            JSON.stringify(err, null, 2)
          );
        } else {
          if (user.Count > 0) {
            return done(null, user);
          } else {
            var param = {
              TableName: "Accounts",
              Item: {
                GG:true,
                id: _id,
                role: 1,
                info: {
                  email: _email,
                  fullname: _fullname
                }
              }
            };
            docClient.put(param, function (error, user) {
              if (err) {
                console.error(
                  "Unable to update item. Error JSON:",
                  JSON.stringify(err, null, 2)
                );
              } else {
                return done(null, user);
              }
            });
          }
        }
      });

    }
  )
);
// ===========================END LOGIN VS GG=====================================

// ===============PAssport==================================

// Passport online
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser((user, done) => {

        var sess = {};
        user.Items.forEach(j)
        {
          sess = {
            GG:j.GG,
            email: j.info.email,
            fullname: j.info.fullname,
            role: j.role,
            id: j.id
          };
        }

        return done(null, sess);
   
});
// Passport local

passport.serializeUser(function (user, done) {
  done(null, user);
})
passport.deserializeUser((user, done) => {
  var _idm = user.Items.id;
  var params = {
      TableName: "Accounts",
      KeyConditionExpression: "id=:id",
      ExpressionAttributeValues: {
          ":id": _idm
      }
  };

  docClient.query(params, function (err, user) {
      if (err) {
          console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
      } else {
          if (user.Count > 0) {
            var sess = {};
            user.Items.forEach(function (j) {
              sess = {
                email: j.info.email,
                fullname: j.info.fullname,
                role: j.role,
                id: j.id
              };
            })
              return done(null, sess);
          }
          else {
              return done(null, false);
          }
      }
  });
})
// Passport local

// ===========================================================
// =======================================================================================================
router.get("/admin-decentralization", function (req, res, next) {
  if (CheckLogin(4, res, req)) {
    // var role=req.session.passport.user.role;
    // var id=req.session.passport.user.id;
    var params = {
      TableName: "Accounts"
    };

    docClient.scan(params, function (err, data) {
      if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
      } else {
        // if(role>1){
          var titletab="Accounts Manager";
        return res.render("../views/account/admin-decentralization.ejs", { data, titletab })
        // }
      }
    });
  }
  else {
    return res.redirect('/error-not-login'); //ERR 500
  }
})
// ========Delete ACC Admin
router.post("/delete-acc-admin", function (req, res, next) {
  if (CheckLogin(4, res, req)) {
    var id = req.body.id;
    var params = {
      TableName: "Accounts",
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
    return res.redirect('/error-not-login'); //ERR 500
  }
})
// ========================
// ============Change Role Admin==============
router.post("/change-role-admin", function (req, res, next) {
  if (CheckLogin(4, res, req)) {
    var id = req.body.id;
    var role = req.body.role;

    var params = {
      TableName: "Accounts",
      Key: {
        id: id
      },
      UpdateExpression:
        "set #role=:a",
      ExpressionAttributeNames: { "#role": "role" },
      ExpressionAttributeValues: {
        ":a": role
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
// ===========================================


// =============GET DETAIL ACC= ADMIN===============
router.get("/get-acc-detail-admin", function (req, res, next) {
  if (CheckLogin(4, res, req)) {
    var id = req.query.id;
    var params = {
      TableName: "Accounts",
      KeyConditionExpression: "id=:id",
      ExpressionAttributeValues: {
        ":id": id
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
  } else {
    return res.redirect('/error-not-login'); //ERR 500
  }
});
// ===========================================
// =============GET DETAIL ACC ALL OBJECT================
router.get("/get-detail-account", function (req, res, next) {
  if (CheckLogin(1, res, req)) {
    var _id = req.session.passport.user.id?req.session.passport.user.id:req.session.passport.user.Items[0].id;
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
        var titletab="Chi Tiết Tài Khoản";
        return res.render("../views/account/detail-acc-owner.ejs", { data, titletab });
      }
    });
  } else {
    return res.redirect('/error-not-login'); //ERR 500
  }
});
// ===========================================
// =============GET DETAIL ACC ALL OBJECT================
router.get("/check-password", function (req, res, next) {
  if (CheckLogin(1, res, req)) {
    var _id = req.session.passport.user.id?req.session.passport.user.id:req.session.passport.user.Items[0].id;
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
        if (data.Count > 0) {
          var oldpass = "";
          data.Items.forEach((i) => {
            oldpass = i.password;
          })
          return res.send(oldpass);
        }
        else {
          return res.send(false);
        }
      }
    });
  } else {
    return res.redirect('/error-not-login'); //ERR 500
  }
});
// ===========================================
// ============Change Role Admin==============
router.post("/change-password", function (req, res, next) {
  if (CheckLogin(1, res, req)) {
    var id = req.session.passport.user.id?req.session.passport.user.id:req.session.passport.user.Items[0].id;
    //  var oldpass=req.body.oldpass;
    var newpass = req.body.newpass;

    var params = {
      TableName: "Accounts",
      Key: {
        id: id
      },
      UpdateExpression:
        "set #pass=:a",
      ExpressionAttributeNames: { "#pass": "password" },
      ExpressionAttributeValues: {
        ":a": newpass
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
// ===========================================
// ==============UPDATE ACCOUNT===============
// =============GET Update ACC ALL OBJECT================
router.get("/get-update-account", function (req, res, next) {
  if (CheckLogin(1, res, req)) {
    var _id = req.session.passport.user.id?req.session.passport.user.id:req.session.passport.user.Items[0].id;
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
        var titletab="Cập Nhật Thông Tin Tài Khoản";
        return res.render("../views/account/update-account.ejs",{titletab});
      }
    });
  } else {
    return res.redirect('/error-not-login'); //ERR 500
  }
});
// ===========================================
// ==========Update Acc==============
router.post("/update-acc", function (req, res, next) {
  if (CheckLogin(1, res, req)) {
    var adress = req.body.adress;
    var birthday = req.body.birthday;
    var fullname = req.body.fullname;
    var phone = req.body.phone;
    var sex = req.body.sex;
    var id = req.session.passport.user.id?req.session.passport.user.id:req.session.passport.user.Items[0].id;
    var params = {
      TableName: "Accounts",
      Key: {
        id: id
      },
      UpdateExpression: "set info.adress=:a, info.birthday=:b, info.fullname=:c, info.phone=:d, info.sex=:g",
      ExpressionAttributeValues: {
        ":a": adress,
        ":b": birthday,
        ":c": fullname,
        ":d": phone,
        ":g": sex
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
  } else {
    return res.redirect('/error-not-login'); //ERR 500
  }
});
// =======End Update ACC=============
// ===========================================


// router.get('/sendmail1',(req,res,next)=>{
 
//   // email
//   // .send({
//   //   template: 'mars',
//   //   message: {
//   //     to: 'lam.truong1996@gmail.com'
//   //   },
//   //   locals: {
//   //     name: 'Lam'
//   //   }
//   // })
//   // .then(console.log)
//   // .catch(console.error);
//  // const email1 = new Email();
// //  email
// //  .send({
// //    template: 'mars',
// //    message: {
// //      to: 'lam.truong1996@gmail.com',
// //      attachments: [
// //        {
// //         // filename: 'logo.png',
// //          content: str
// //        }
// //      ]
// //    },
// //    locals: {
// //      name: 'Elon'
// //    }
// //  })
// //  .then(console.log)
// //  .catch(console.error);
// var message	= {
//   html:'<img src="https://drive.google.com/file/d/1hRDd_ORbV04kwUWht1u9DvWfXoEob21L/view?usp=sharing">',
//   from:	"lozodo831@gmail.com", 
//   to:		"lam.truong1996@gmail.com",
//  // cc:		"else <else@your-email.com>",
//   subject:	"testing emailjs",
//   attachment: 
//   [
//      {data: "https://drive.google.com/file/d/1hRDd_ORbV04kwUWht1u9DvWfXoEob21L/view?usp=sharing"},
//     // inline=true
//     // {path:"path/to/file.zip", type:"application/zip", name:"renamed.zip"},
//      //{path:"D:/IUH/logo.png", type:"image/png", headers:{"Content-ID":"<my-image>"}}
//   ], 
 
// };
// server.send(message, function(err, message) { console.log(err || message); });
//  })

module.exports = router;
