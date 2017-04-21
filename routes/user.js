var User = require('../models/User.js'); //User mocule
var bluepage = require('ibm_bluepages');
var filter = require('../models/Filter.js');

/*
 * GET users listing.
 */

// exports.list = function(req, res){
//   res.send("respond with a resource");
// };
module.exports = function(app) {
  app.post('/adminLogin', function(req, res) {
    var intrID = req.body.intrID;
    var pwd = req.body.pwd;
    if (intrID && pwd) {
      if (filter.admin.id == intrID) {
        if (filter.admin.pwd == pwd) {
          req.session.adminUserID = filter.admin.id;
          console.log('[AdminLogin]Login Successfully');
          res.json({
            'errType': 0
          });
        } else {
          console.log('[AdminLogin]Wrong Password');
          res.json({
            'errType': 2
          });
        }
      } else {
        console.log('[AdminLogin]intrID incorrect');
        res.json({
          'errType': 1
        });
      }
    } else {
      console.log('[AdminLogin]intrID or pwd is null');
    }
  });


  app.post('/login', function(req, res) {
    User.findOne({
      'intrID': req.body.intrID
    }, function(err, user) {
      if (err) {
        console.log('[Login]DB err : ' + err);
        res.json({
          'errType': 3
        });
      } else if (user) {
        if (user.pwd == req.body.pwd) {
          console.log('[Login]Successfully' + user);
          req.session.user_id = req.body.intrID;
          var profile = {
            intrID: user.intrID,
            pwd: user.pwd,
            name: user.name
          };
          res.json({
            'errType': 0,
            'token': token,
            'name': profile.name
          });
        } else {
          console.log('[Login]Wrong Password');
          console.log("db_pwd =" + user.pwd + "   pwd =" + req.body.pwd);
          res.json({
            'errType': 2
          });
        }
      } else {
        console.log('[Login]No User found');
        res.json({
          'errType': 1
        });
      }
    });
  });

  app.post('/user/logOut', function(req, res){
    req.session.destroy(function(err){
      res.send(err);
    });
  });

  app.post('/admin/logOut', function(req, res){
    req.session.destroy(function(err){
      res.send(err);
    });
  });

  app.post('/register', function(req, res) {
    var intrID = req.body.intrID;
    if (intrID) {
      intrID = intrID.replace(/(^\s+)|(\s+$)/g, '');
    }
    var newUser = {
      'intrID': intrID,
      'name': req.body.name,
      'pwd': req.body.pwd,
      'phoneNum': req.body.phoneNum
    };

    var validateEmail = /^\w{1,22}(@cn.ibm.com)$/;
    var validatePwd = /(?=^\S{6,22}$)(?!(^[a-zA-Z\`\~\!\@\#\$\%\^\&\*\;\:\'\"\,\<\.\>\-\_\=\+\(\)\[\]\{\}\?\/\\\|]*$))(?!(^[0-9\`\~\!\@\#\$\%\^\&\*\;\:\'\"\,\<\.\>\-\_\=\+\(\)\[\]\{\}\?\/\\\|]*$))/;
    var validatePhone = /^[0-9]{11}$/;

    var validateFail = '';

    if (validateEmail.test(newUser.intrID)) {
      // console.log('email pass');
    } else {
      validateFail += "e";
    }
    if (validatePwd.test(newUser.pwd)) {
      // console.log('password pass');
    } else {
      validateFail += "w";
    }
    if (newUser.phoneNum) {
      if (validatePhone.test(newUser.phoneNum)) {
        // console.log('phonenumber pass');
      } else {
        validateFail += "p";
      }
    }

    if (validateFail == '') {
      User.findOne({
        'intrID': req.body.intrID
      }, function(err, user) {
        if (err) {
          console.log('[Register]DB find uer err : ' + err);
          res.json({
            'errType': 3
          });
        } else if (!user) {
          User.create(newUser, function(err, newuser) {
            if (err) {
              console.log('[Register]DB insert uer err : ' + err);
              res.json({
                'errType': 3
              });
            } else if (newuser) {
              console.log('[Register]DB insert newuser Successful' + newuser);
              res.json({
                'errType': 0,
                'RegUser': newuser
              });
            } else {
              console.log('[Register]Failed');
              res.json({
                'errType': 3
              });
            }
          });
        } else {
          console.log('[Register]User existed');
          res.json({
            'errType': 1
          });
        }
      })
    } else {
      console.log('[Register]validateFail');
      res.json({
        'errType': 2
      });
    }
  });

  app.post('/intrIDLogin', function(req, res) {
    var intrID = req.body.intrID;
    var pwd = req.body.pwd;

    bluepage.authenticate(intrID, pwd, function(success) {
      if (success) {console.log("bluepage.authenticate Successfully.");
        bluepage.getPersonInfoByIntranetID(intrID, function(result) {
          if (result === 'error') {console.log("bluepage.getPersonInfoByIntranetID error!");
            res.send({
              errType: 1
            });
          } else {console.log("bluepage.getPersonInfoByIntranetID Successfully.");
            var phoneNum = result.userTelephonenumber.slice(result.userTelephonenumber.indexOf('-')).replace(/[\-]+/g, '');
            var newUser = {
              'intrID': intrID,
              'name': result.userName,
              'phoneNum': phoneNum
            };
            var profile = {
              intrID: intrID,
              pwd: pwd,
              name: result.userName
            };
            req.session.user_id = intrID;
            req.session.user = result.userName;
            User.findOne({
              'intrID': intrID
            }, function(err, user) {
              if (err) {
                res.send({
                  errType: 1
                });
              } else if (!user) {
                User.create(newUser, function(err, user) {
                  res.send({
                    errType: 0,
                    name: result.userName,
                    phoneNum: phoneNum,
                    image: 'https://w3-connectionsapi.ibm.com/profiles/photo.do?email=' + intrID,
                  });
                });
              } else {
                User.findByIdAndUpdate({
                  _id: user._id
                }, newUser, function(err, user) {
                  res.send({
                    errType: 0,
                    name: result.userName,
                    phoneNum: phoneNum,
                    image: 'https://w3-connectionsapi.ibm.com/profiles/photo.do?email=' + intrID,
                  });
                });
              };
            })
            console.log('GetNameByIntranetID', result);
          }
        });
      } else {console.log("bluepage.authenticate Failed!");
        res.send({
          errType: 1
        });
      };
    });
  });


};
