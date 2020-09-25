const mongoose=require("mongoose")
const validator=require("validator")
const passportLocalMongoose = require("passport-local-mongoose")

const UserSchema=new mongoose.Schema({
    firstname:String,
    lastname:String,
    email:{type:String,
        trim:true,
        lowercase:true,
        validate: {
            validator: validator.isEmail,
            message: "Email is not valid."
        }
    },
    password:{
        type:String,
        //encrypt the password
        set(val){
            return require('bcryptjs').hashSync(val,10)
        }
    },
    confirmPassword:{
        type:String
    },
    country:String,
    city:String,
    state:String,
    address:String,
    address2:String,
    number:{
        type:String,
        validate:{
            validator:function(value){
                return value==""||validator.isMobilePhone(value)
            },
            message:"Phone number is not valid."
        }
    }
})

UserSchema.plugin(passportLocalMongoose)

module.exports=mongoose.model("User",UserSchema)