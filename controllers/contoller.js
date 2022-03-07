    //import modules
    const bcrypt = require('bcrypt'),
          User =  require('../models/model'),
          {validationResult} = require('express-validator'),
          sendgridTransport = require('nodemailer-sendgrid-transport'),
          nodemailer = require('nodemailer'),
          sgMail = require('@sendgrid/mail');
    
    //post sign up middleware config
    exports.postSignUp =  (req , res) => {
       const {firstName, lastName, email, password, confirmPassword } = req.body;
       const salt = bcrypt.genSaltSync(10);

       User.findOne({email}).then(userDoc => {
           if(userDoc){
             return  res.json({"message" : "this email already exist"});
           }
           return bcrypt.hash(password , salt);
           }).then(function(hashpassword){
                const user = new User({
                firstName,
                lastName,
                email,
                password : hashpassword
           });
           return user.save();
       }).catch(err =>{ 
           console.log(err);
        });
       res.send({message : "Successfully sing up"});
    };

    //post sign in middleware config
    exports.postSignIn = (req, res, next) => {
      const email = req.body.email;
      const password = req.body.password;
    
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({
          "message" : "something went wrong"
        });
      }
    
      User.findOne({email})
        .then(user => {
          if (!user) {
            return res.status(422).json({
              "message" : "users don't exist" 
            });
          }
          bcrypt
            .compare(password, user.password)
            .then(doMatch => {
              if (doMatch) {
                // req.session.isLoggedIn = true;
                // req.session.user = user;
                return req.session.save(err => {
                  console.log(err);
                  res.redirect('/');
                });
              }
              return res.status(422).json({
                firstName,
                lastName,
                email
              });
            })
            .catch(err => {
              console.log(err);
            });
        })
        .catch(err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    };

    //get sign in middleware config
    exports.json({});
    

    //reset mdp    
    //post reset
    exports.postReset = (req, res, next) => {
      crypto.randomBytes(32, (err, buffer) => {
        if (err) {
          console.log(err);
          return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        User.findOne({ email: req.body.email })
          .then(user => {
            if (!user) {
              req.flash('error', 'No account with that email found.');
              return res.redirect('/reset');
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            return user.save();
          })
          .then(result => {
            res.redirect('/');
            transporter.sendMail({
              to: req.body.email,
              from: 'intside@corporation.com',
              subject: 'Password reset',
              html: `
                <p>You requested a password reset</p>
                <p>Click this <a href="http://localhost:8080/reset/${token}">link</a> to set a new password.</p>
              `
            });
          })
          .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
          });
      });
    };
    //get reset
    exports.getReset = (req, res, next) => {
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: message
      });
    };

    const set_Mail_Apy_key = sgMail.setApiKey(process.env.SEND_GRID_MAIL);
    const transporter = nodemailer.createTransport(
      sendgridTransport({
        auth: {
          api_key: set_Mail_Apy_key
        }
      })
    );

    //New password
    //get new password
    exports.getNewPassword = (req, res, next) => {
      const token = req.params.token;
      User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
          let message = req.flash('error');
          if (message.length > 0) {
            message = message[0];
          } else {
            message = null;
          }
          res.render('auth/new-password', {
            path: '/new-password',
            pageTitle: 'New Password',
            errorMessage: message,
            userId: user._id.toString(),
            passwordToken: token
          });
        })
        .catch(err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    };
    
    //post new password
    exports.postNewPassword = (req, res, next) => {
      const newPassword = req.body.password;
      const userId = req.body.userId;
      const passwordToken = req.body.passwordToken;
      let resetUser;
    
      User.findOne({
        resetToken: passwordToken,
        resetTokenExpiration: { $gt: Date.now() },
        _id: userId
      })
        .then(user => {
          resetUser = user;
          return bcrypt.hash(newPassword, 12);
        })
        .then(hashedPassword => {
          resetUser.password = hashedPassword;
          resetUser.resetToken = undefined;
          resetUser.resetTokenExpiration = undefined;
          return resetUser.save();
        })
        .then(result => {
          res.redirect('/login');
        })
        .catch(err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    };