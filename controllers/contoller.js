const User = require('../models/model');

exports.postSignUp = (req , res, next) => {
 const email = req.body.email;
 const password = req.body.mdp;
 const passwordConfirme = req.body.cmpd;
 
 User.findOne({email : email})
     .then(userInfo => {
     if(userInfo){
         return res.redirect('/signup');
     }
     const newUser = new User({
         email : email,
         password : password,
         confirmPassword : passwordConfirme
     });
     return newUser.save();
    })
    .then(result => {
        res.json({message : "successfully account created !"});
    }) 
     .catch(err => console.log(err));
};

exports.getSignIn = (req , res, next) => {
    res.status(200).json({key : "Hey everything is it okay, this is my main first node js api rest"});
};