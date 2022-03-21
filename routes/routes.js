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

    // body("confirmPassword").custom((value, {req}) => {
    //   if(value !== req.body.password){
    //     throw new Error("Password doesn't match");
    //   }
    //   return true;
    // })
  ],
  middlController.postSignUp
);

router.post(
  "/user-sign-in",
  [body("email").isEmail(), body("password").isLength().isAlphanumeric()],
  middlController.postSignIn
);
router.post("/user-reset-pass", [
  body("email")
      .isEmail()
      .withMessage("Please enter a valide email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (!userDoc) {
            return Promise.reject(
              "email not exist"
            );
          }
          return true;
        });
      })
      .normalizeEmail(),
], 
middlController.sendPasswordResetEmail);
router.post("/user-mail-update", middlController.postNewPassword);
router.use(require("./tokenChecker"));

//export routes
module.exports = router;
