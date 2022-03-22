//import modules
const express = require("express");
const { body, validationResult } = require("express-validator");

//initialize
const router = express.Router();

//import middleware
const middlController = require("../controllers/contoller");
const User = require("../models/model");

//routes config
router.post(
  "/user-sign-up",
  [
    body("firstName")
      .isAlpha()
      .withMessage("Your last name must contains the special character"),

    body("lastName")
      .isAlpha()
      .withMessage("Your last name must contains the special character"),

    body("email")
      .isEmail()
      .withMessage("Please enter a valide email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "email already exist, choose another one please"
            );
          }
          return true;
        });
      })
      .normalizeEmail(),

    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("please enter a password with at least 5 character")
      .isAlphanumeric()
      .withMessage("Your password must contains the special charactere"),
  ],
  middlController.postSignUp
);

router.post(
  "/user-sign-in",
  [body("email").isEmail(), body("password").isLength().isAlphanumeric()],
  middlController.postSignIn
);
router.post(
  "/user-reset-pass",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valide email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (!userDoc) {
            return Promise.reject("email not exist");
          }
          return true;
        });
      })
      .normalizeEmail(),
  ],
  middlController.sendPasswordResetEmail
);
router.put(
  "/user-password-update",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter valide email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (!userDoc) {
            return Promise.reject("Email doesn't exist");
          }
          return true;
        });
      })
      .normalizeEmail(),

    body("password")
      .isLength({ min: 5 })
      .withMessage("Please enter a password with at least 5 character")
      .isAlphanumeric()
      .withMessage("Your password must not contains a special charactere"),
  ],
  middlController.postNewPassword
);

//export routes
module.exports = router;
