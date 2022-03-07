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
       console.log(password);
       const confirmPassword = req.body.confirmpassword;

       User.findOne({email : email}).then(userDoc => {
           if(userDoc){
             return  res.json({"message" : "this email already exist"});
           }
           return bcrypt.hash(password , 12);
           }).then(hashpassword => {
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
    exports.userSignIn = (req , res) =>{
        const email = req.body.email;
        const password = req.body.password;

        User.findOne({email : email}).then(userInfo =>{
            if(!userInfo){
                res.json({"message" : "user not exist"});
            }
            bcrypt.compare(password , userInfo.password).then(reslt =>{
                if(reslt){
                    req.session.isLoggedIn = true;
                    req.session.userInfo = userInfo;
                    return req.session.save(err => {
                        console.log(err);
                        return res.redirect('/');
                    });
                }
                res.redirect('/');
            }).catch(err => console.log(err));
        });
    };
})();