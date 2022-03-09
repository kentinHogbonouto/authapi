//import modules
const express = require("express");
const { body, validationResult } = require("express-validator/check");

//initialize
const router = express.Router();

//import middleware
const middlController = require("../controllers/contoller");
const User = require("../models/model");

//routes config
router.post(
  "/user-sign-up",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valide email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "email already exist, choose another one please"
            );
          }
        });
      })
      .normalizeEmail(),
    body("password", "please enter a password with at least 5 character")
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body("firstName").isEmpty(),
    body("lastName").isEmpty(),
  ],
  middlController.postSignUp
);
router.post(
  "/user-sign-in", 
  [
    check("email").isEmail(), 
    body("password")
    .isLength()
    .isAlphanumeric()
  ] , 
  middlController.postSignIn
);
router.post("/user-reset-pass", middlController.postReset);
router.post("/user-mail-update", middlController.postNewPassword);

//export routes
module.exports = router;
