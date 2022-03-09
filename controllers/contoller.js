//import modules
const bcrypt = require("bcrypt");
const  User = require("../models/model");
const  crypto = require("crypto");
const  sgMail = require("@sendgrid/mail");

//post sign up middleware config
exports.postSignUp = (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const confirmPassword = req.body.confirmPassword;

  const salt = bcrypt.genSaltSync(10);
  User.findOne({ email })
    .then((userDoc) => {
      if (userDoc.email) {
        return res.json({ message: "this email already exist" });
      }
      return bcrypt.hash(password, salt);
    })
    .then((hashpassword) => {
      const user = new User({
        firstName,
        lastName,
        email,
        password: hashpassword,
      });
      return user.save();
    })
    .catch((err) => {
      console.log(err);
    });
  res.json({ message: "Successfully sing up" });
};

//post sign in middleware config
exports.postSignIn = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .then((userInfo) => {
      if (!userInfo) {
        res.json({ message: "user does'nt existe" });
      }
      bcrypt
        .compare(userInfo.password, password)
        .then((data) => {
          res.json({
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
            email: userInfo.email,
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

//reset mdp
const set_Mail_Apy_key = sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const transporter = nodemailer.createTransport(
  sendgridTransport({
    service : "Gmail",
    auth: {
      user : "kentinhogbonouto1@gmail.com",
      api_key: set_Mail_Apy_key,
    },
  })
);
//post reset
exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    const email = req.body.email;
    if (err) {
      console.log(err);
      return res.json({
        message: "something went wrong ! check your script and try again",
      });
    }
    const token = buffer.toString("hex");
    User.findOne({ email })
      .then((user) => {
        if (!user) {
          req.json({ message: "No account with that email found." });
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        const mailSetting = {
          from: "kentinhogbonouto1@gmail.com",
          to: req.body.email,
          subject: "Password reset",
          html: `<p>Click this <a href="http://localhost:8080/user-mail-update/${token}">link</a> to set a new password.</p>`,
        };
        transporter.sendMail(mailSetting , (err , info) =>{
          if(err) throw err;
          console.log("mail sent");   
        });
        res.json({ message: "reset email send successfully" });
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

//New password
//post new password
exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
