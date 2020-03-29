const mongoose = require('mongoose')
const shortid = require('shortid');

const Users = new mongoose.Schema({
    _id : {
        type : String,
        default : shortid.generate
    },
    username : {
        type : String,
        required : true
    }
})


const User = mongoose.model('Users',Users);

module.exports = User;