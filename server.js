const express = require('express'),
      mongoose = require('mongoose'),
      path = require('path');
      require('dotenv').config({path : path.resolve(__dirname, './.env')});

//database connection
mongoose.connect(process.env.DB_URI);

//express initialize
const app = express();

//
// app.use('/' , (req, res, next) =>{
//     res.sendFile(__dirname + "/views/index.html");
// });

app.get('/', (req , res, next) =>{
    res.send('<h1>Hello world</h1>')
});

//set router
const routes = require('./routes/routes.js');

//use route
app.use("/auth/api/" , routes);


//listener port
app.listen(process.env.PORT);