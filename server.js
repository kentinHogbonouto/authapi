    //import modules
    const express = require('express'),
    bodyParser = require('body-parser'),
    path = require('path'),
    mongoose = require('mongoose');
    require('dotenv').config({path : path.resolve(__dirname , './.env')});

    //import routes
    const router = require('./routes/routes');

    //Database connection
    mongoose.connect(process.env.DB_URI);
    // .then(db => {
    //     console.log('connexion succed');
    // }).catch(err => console.log(err));
     const db = mongoose.connection;
     db.on('error', console.error.bind(console, 'connection error:'));
     db.once('open', function() {
      console.log("connexion succeed");
     });

    //initialize server
    const app = express();

    //initialize body parser
    app.use(bodyParser.urlencoded({extended : false}));
    app.use(bodyParser.json());

    //setting routes
    app.use('/auth/api' , router);

    //listen PORT
    app.listen(process.env.PORT || 3000);