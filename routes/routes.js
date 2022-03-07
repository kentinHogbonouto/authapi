(function(){
    'use strict';
    //import modules
    const express = require('express');

    //initialize
    const router = express.Router();

    //import middleware
    const middlController = require('../controllers/contoller');

    //routes config
    router.post('/userSignUp' , middlController.userSignUp);
    router.post('/userSignIn' , middlController.userSignIn);

    //export routes
    module.exports = router;
})();
