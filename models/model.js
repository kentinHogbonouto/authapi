    //import
    const mongoose = require('mongoose');

    //initializeschema
    const Schema = mongoose.Schema;

    //setting schema model 
    const userSchema = new Schema({
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required : true
        },
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        }    
    });

    module.exports = mongoose.model('User' , userSchema);