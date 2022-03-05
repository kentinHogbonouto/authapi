//initialize express
//d'où vient il la methode Router de l'object express ?
const express = require('express');
const router = express.Router();

//set controllers
const controller = require("../controllers/contoller");

//set routes
router.get('/sign-up', controller.postSignUp);
router.get('/sign-in', controller.getSignIn);

//export routes
module.exports = router;