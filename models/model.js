const mongoose = require('mongoose');

//initialze schema
Schema = mongoose.Schema;

//schema model definition
const userInfo = new Schema({
    email : {
        type : String,
        require : true
    },
    password : {
        type : String,
        require : true
    }
});