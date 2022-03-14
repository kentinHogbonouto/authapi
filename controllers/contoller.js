//import modules
const bcrypt=require("bcrypt");
const User=require("../models/model");
const crypto=require("crypto");
const sgMail=require("@sendgrid/mail");
const nodemailer=require("nodemailer");
const tokenList={};
const {validationResult}=require("express-validator");
const jwt=require("jsonwebtoken");

const jwtKey=process.env.JWT_KEY;
const jwtExpSec=300;
const jwtRefreshExpSec=8600;
const jwtRefreshKey=process.env.JWT_REFRESH_KEY;

//post sign up middleware config
exports.postSignUp = (req, res, next) => {
  const {firstName,lastName,email,password,confirmPassword}=req.body;

  const errors=validationResult(req);
  if (!errors.isEmpty()){
    res.json({message: "You will put right information, please try again"});
  }
  const salt=bcrypt.genSaltSync(10);
  User.findOne({email})
    .then((userDoc) => {
      if (userDoc) {
        res.json({ message: "this email already exist" });
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

  if (!email || !password) {
    return res.statut(402).end();
  }

  const user = {
    email: email,
    password: password,
  };

  const token = jwt.sign({ user }, jwtKey, { expiresIn: jwtExpSec });
  const refreshToken = jwt.sign({ user }, jwtRefreshKey, {
    expiresIn: jwtRefreshExpSec,
  });
  const response = {
    statut: "Logged In",
    token: token,
    refreshToken: refreshToken,
  };
  tokenList[refreshToken] = response;
  res.status(200).json({ response });

  // User.findOne({email})
  //   .then((userInfo) => {
  //     if (!userInfo) {
  //       res.json({ message: "user does'nt existe" });
  //     }
  //     bcrypt
  //       .compare(userInfo.password, password)
  //       .then((data) => {
  //         res.json({
  //           firstName: userInfo.firstName,
  //           lastName: userInfo.lastName,
  //           email: userInfo.email,
  //         });
  //       })
  //       .catch((err) => console.log(err));
  //   })
  //   .catch((err) => console.log(err));
};

exports.postToken = (req, res) => {
  const postData = req.body;

  if (postData.refreshToken && postData.resetToken in tokenList) {
    const user = {
      email: postData.email,
      password: postData.password,
    };
    const token = jwt.sign({ user }, jwtKey, { expiresIn: jwtExpSec });
    const response = {
      token: token,
    };
    tokenList[postData.refreshToken] = response;
    response.status(200).json(response);
  }
  res.status(404).json({ message: "invalid request" });
};

exports.verifyToken = (req, res, next) => {
  const header = req.headers["...authorization"];
  if (typeof header !== "undefined") {
    const bToken = header.split("")[1];
    req.token = bToken;
    next();
  }
  res.json({ message: "Not log in" });
};

exports.getSignIn = (req, res, next) => {
  try {
    jwt.verify(req.token, jwtKey, (error, authData) => {
      if (error) {
        res.json({ message: "not log" });
      }
      res.json({ message: "post created", authData });
    });
  } catch (error) {}
};

//reset mdp
// const set_Mail_Apy_key = sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// const transporter = nodemailer.createTransport("SMTP",
//   {
//     service: "gmail",
//     auth: {
//       user: "kentinhogbonouto1@gmail.com",
//       api_key: set_Mail_Apy_key,
//     },
//   });

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
        transporter.sendMail(mailSetting, (err, info) => {
          if (err) throw err;
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
