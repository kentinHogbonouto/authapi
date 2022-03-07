    //import modules
    const express = require('express');

    //initialize
    const router = express.Router();

    //import middleware
    const middlController = require('../controllers/contoller');

    //routes config
    router.post('/user-sign-up' , middlController.postSignUp);
    router.post('/user-sign-in' , middlController.postSignIn);

    //export routes
    module.exports = router;
