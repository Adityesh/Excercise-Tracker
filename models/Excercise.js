const mongoose = require('mongoose')
const shortid = require('shortid');

const Excercises = new mongoose.Schema({
    userId : {
        type : String,
        required : true
    },
    username : {
        type : String,
        required : true
    },
    
    description : {
        type: String,
        required : true,
        maxlength : [20, "Description too long"]
    },
    duration : {
        type : Number,
        required : true
    },
    date : {
        type : String,
        required : true
    }
    
})


const Excercise = mongoose.model('Excercises',Excercises);

module.exports = Excercise;