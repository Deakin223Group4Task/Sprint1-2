const mongoose=require('mongoose');
const User=require('mongoose').model('User');
const Car=require('./car');
var Schema = mongoose.Schema

const linkSchema=new mongoose.Schema({
    car:{type:Schema.Types.ObjectId,required:true,ref:'Car'},
    user:{type:Schema.Types.ObjectId,required:true,ref:'User'}
})

module.exports = mongoose.model("UClink",linkSchema)