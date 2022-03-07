(function(){
    'use strict';
    //import
    const bcrypt = require('bcrypt');
    const User =  require('../models/model');
    
    //sign up middleware config
    exports.userSignUp =  (req , res) => {
       const firstName = req.body.firstName;
       const lastName = req.body.lastName;
       const email = req.body.email;
       const salt = bcrypt.genSaltSync(10);
       const password = req.body.password;
       const confirmPassword = req.body.confirmpassword;
       
       User.findOne({email : email}).then(userDoc => {
           if(userDoc){
             return  res.json({"message" : "this email already exist"});
           }
           return bcrypt.hash(password , salt);
           }).then(function(hashpassword){
                const user = new User({
                firstName : firstName,
                lastName : lastName,
                email : email,
                password : hashpassword
           });
           return user.save();
       }).catch(err =>{ 
           console.log(err);
        });
       res.send({message : "Successfully sing up"});
    };

    //sign in middleware config
    exports.userSignIn = (req, res, next) => {
        const email = req.body.email;
        const password = req.body.password;
        User.findOne({ email: email })
          .then(user => {
            if (!user) {
              return res.redirect('/userSignIn');
            }
            bcrypt
              .compare(password, user.password)
              .then(doMatch => {
                if (doMatch) {
                  req.session.user = user;
                  return req.session.save(err => {
                    console.log(err);
                    res.redirect('/');
                  });
                }
                res.redirect('/userSignIn');
              })
              .catch(err => {
                console.log(err);
                res.redirect('/userSignIn');
              });
          })
          .catch(err => console.log(err));
      };
})();