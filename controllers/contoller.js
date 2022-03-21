//import node modules
const bcrypt = require("bcrypt");
const User = require("../models/model");
const crypto = require("crypto");
const tokenList = {};
const { validationResult } = require("express-validator");
const createUserToken = require("../helpers/createUserToken");
const {
  INCORRECT_EMAIL,
  USER_ALREADY_EXIST,
  NOT_EMPTY_PASSWORD,
  INVALID_REQUEST,
  NOT_LOGIN,
  NO_ACCOUNT,
  PASS_RESET_MAIL,
} = require("../validations/messages");
const { selectFields } = require("express-validator/src/select-fields");
const { urlencoded } = require("body-parser");

//post sign up middleware config
exports.postSignUp = (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    const error = new Error("validation failed");
    error.status = 422;
    error.data = errors.array();
    throw error;
  }

  const { firstName, lastName, email, password } = req.body;
  const salt = bcrypt.genSaltSync(10);
  User.findOne({ email })
    .then((userInfo) => {
      if (userInfo) {
        const error = new Error(USER_ALREADY_EXIST);
        error.status = 403;
        throw error;
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
    .then((userInfo) => {
      console.log(userInfo);
      return User.findById(userInfo._id);
    })
    .then((userInfo) => {
      const token = createUserToken(
        userInfo._id.toString(),
        userInfo.email,
        userInfo.status
      );
      console.log("user successfully signup", userInfo);

      /**
       * TODO
       * successfully message
       * Welcom email to the client
       */

      res.status(201).json({
        message: "successfully sign up",
        user: userInfo,
        token: token,
        success: true,
      });
    })
    .catch((err) => {
      if (!err.status) {
        err.status = 500;
      }
      next(err);
    });
};

//post sign middleware config
exports.postSignIn = (req, res, next) => {
  const { email, password } = req.body;
  let loadedUser;

  User.findOne({ email })
    .select("email password")
    .then((user) => {
      if (!user) {
        const error = new Error();
        error.status = 403;
        throw error;
      }
      loadedUser = user;
      if (!user.password) {
        const error = new Error();
        error.status = 403;
        throw error;
      }
      return bcrypt.compare(password || "", user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error();
        error.status = 403;
        throw error;
      }
      const token = createUserToken(
        loadedUser._id.toString(),
        loadedUser.email,
        loadedUser.status
      );
      res.status(200).json({
        message: "successfully authenticated",
        token: token,
        success: true,
      });
    })
    .catch((err) => {
      if (!err.status) {
        err.status = 500;
      }
      next(err);
    });
};

//post reset email sender config
exports.sendPasswordResetEmail = (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    const error = new Error("validation failed");
    error.status = 500;
    throw error;
  }

  const { email } = req.body;
  User.findOne({ email })
    .select("+resetToken +resetTokenExpiration")
    .then((user) => {
      if (!user) {
        const error = new Error();
        error.status = 403;
        throw error;
      }
      crypto.randomBytes(32, (err, buffer) => {
        const token = buffer.toString("Hex");
        if (err) {
          const error = new Error("");
          error.status = 403;
          throw error;
        }
        User.findOne({ email }).then((user) => {
          if (!user) {
            const error = new Error("");
            error.status = 403;
            throw error;
          }
          user.resetToken = token;
          user.resetTokentExpiration = Date.now() + 3600000;
          user.save();
        });
      });
    })
    .then((user) => {
      /**
       * TODO
       * send reset email to user
       */
    })
    .then(() => {
      res.status(200).json({
        message: "Email successfully sent",
        success: true,
      });
    })
    .catch((err) => {
      if (!err.status) {
        err.status = 500;
      }
      next(err);
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
