//import node modules
const bcrypt = require("bcrypt");
const User = require("../models/model");
const crypto = require("crypto");
const sgMail = require("@sendgrid/mail");
const tokenList = {};
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const jwtKey = process.env.JWT_KEY;
const jwtExpSec = 300;
const jwtRefreshExpSec = 8600;
const jwtRefreshKey = process.env.JWT_REFRESH_KEY;
const {INCORRECT_EMAIL, } = require("../validations/messages");

//post sign up middleware config
exports.postSignUp = (req, res, next) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;

  const errors = validationResult(req);

  console.log(errors);
  if (errors.isEmpty()) {
    const salt = bcrypt.genSaltSync(10);
    User.findOne({ email })
      .then(() => {
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
      .then(() => {
        res.json({ message: INCORRECT_EMAIL });
      })
      .catch((err) => {
        console.log(err);
      });
  }
  next();
};

//post sign in middleware config
exports.postSignIn = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .statut(402)
      .json({ message: NOT_EMPTY_PASSWORD });
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
  next();
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
  res.status(404).json({ message: INVALID_REQUEST });
};

exports.verifyToken = (req, res, next) => {
  const header = req.headers["...authorization"];
  if (typeof header !== "undefined") {
    const bToken = header.split("")[1];
    req.token = bToken;
    next();
  }
  res.json({ message: NOT_LOGIN });
};

//post reset
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
exports.postReset = (req, res, next) => {
  const { email } = req.body;
  console.log(email);
  const msg  = {
    to: email,
    from: "kentinhogbonouto1@gmail.com",
    subject: "Reset password instructions",
    html: `
          <strong>
            Hello ${email}<br>
          </strong>
          <p>
            Someone has requested a link to change your password. 
            You can do this through the link below: http://127.0.0.1/auth/api/user-reset-pass/${token}
            or copy and open this link in your browser:
            <a href="http://127.0.0.1/auth/api/user-reset-pass/${token}">change password</a>
            If you didn't request this, please ignore this email.
            Your password won't change until you access the link above and create a new one.
          </p>
        `,
  }; 
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
    }
    const token = buffer.toString("hex");
    User.findOne({ email })
      .then((user) => {
        if (!user) {
          req.flash("err", NO_ACCOUNT);
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(response =>{
        return sgMail.send(msg);
      })
      .then(response =>{
        console.log(response);
        res.json({ message: PASS_RESET_MAIL });
      })
      .catch((error) => {
        console.error(error);
      });
  });
};

//New password
//post new password
exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const { userId, passwordToken } = req.body;
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
