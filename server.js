const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const Car = require("./models/car");
const User = require("./models/user");
const Link=require("./models/UClink");
const mongoose = require("mongoose")
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))
mongoose.connect("mongodb://localhost:27017/testLink", { useNewUrlParser: true, useUnifiedTopology: true });
const mail = require("./email")
const bcrypt = require("bcrypt");
const saltRounds = 10;
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('express-flash');
var nodemailer = require('nodemailer');
var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy


app.use(express.static("public"))
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    cookie: { maxAge: 20000 },
    resave: false,
    saveUninitialized: false,
    secret: '$$$iCrowdTask',
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(flash())

passport.use('local', new LocalStrategy({
    usernameField: "email",
    passReqToCallback: true
},
    function (username, password, done) {
        User.findOne({ username: username }).then(user => {
            if (!user) return done(null, false);
            if (!user.authenticate(password)) return done(null, false);
            return done(null, user);
        })
    }
));
passport.serializeUser(function (user, done) {
    if (user) return done(null, user._id);
});
passport.deserializeUser(function (user, done) {
    User.findById(id).then(user => {
        if (!user) return done(null, false);
        return done(null, user);        
    });
});

app.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        res.sendFile(__dirname + "/index.html")//如果已授权就直接登入
    } else {
        res.sendFile(__dirname + '/login.html')//默认发送登录页
    }
})

app.get('/register', (req, res) => {
    res.sendFile(__dirname + "/register.html")
})
app.get('/forgetpassword', (req, res) => {
    res.sendFile(__dirname + "/forgetpassword.html")
})
app.get('/reset', (req, res) => {
    res.sendFile(__dirname + "/reset.html")
})
app.get('/carSignUp',(req,res) =>{
    res.sendFile(__dirname+"/carSignUp.html")
})

app.post('/carSignUp', (req,res,next)=>{
    let model = req.body.model;
    let type = req.body.type;
    let vin = req.body.vin;
    let problems = req.body.problems
    Car.findOne({vehicleModel:model,vehicleType:type},(err,car1)=>{
        if(car1){
            res.sendFile(__dirname+"./successful.html")    
        }else{
            const newCar = new Car({
                vehicleType:type,
                vehicleModel:model,
                vin:vin,
                problems:problems
            })
            newCar.save().catch((err)=>console.log)
        }
    })
    //用户-车 连接
    let carid =req.body.carID;
    let userid=req.user._id; //user.id被sprint1的passport保存
    Car.findById(carid,(err,datac)=>{
        if(err){console.log(err)}
        else{
            User.findById(userid,(err,datau)=>{
                if(err){console.log(err)}
                else{
                    const subs=new Link({
                        car:carid,
                        user:userid
                    })
                    subs.save()
                }
            })
        }
    })
}
)

app.post('./problems',(req,res)=>{
    let model = req.body.model;
    let type = req.body.type;
    let problems = req.body.problems;
    let vin = req.body.vin;
    Car.findOne({vin:vin},(err,item)=>{
        Car.update({problems:problems}).then(result=>{
            return;
        })
    })  
    let car_arr = Car.find({vehicleModel:model,vehicleType:type},{"_id":1})
    let user_arr =new Array();
    for(key in car_arr){
        user_arr.push(Link.find({_id:key},{"_id":1}))
    }
    let email_arr = new Array();
    for(key in user_arr){
        email_arr.push(User.find({_id:user_arr},{"email":1}))
    }
    mail.send({
        from: '"SIT313" <sit223.group4@gmail.com>',
        to: email_arr,
        subject: 'Car Problems',
        text: 'You are receiving this because we have found the new problems of your car.\n' +
          'Please check the problems:\n' +req.body.problems,
    });
    res.send("Reset password email has been sent")
})

app.post('/search', async(req,res)=>{
    const car = await Car.findOne({
        vehicleType:req.body.make,
        vehicleModel:req.body.model
    })
    if(!car) {
        alert("Car model doesn't exist.")
    }
    res.send(car.problems)
})

app.post('/login',(req,res)=>{
    if (req.isAuthenticated()) { 

    let Password = req.body.password;//获取表单中的密码
    let value = req.body.email;//获取表单中的邮箱
        
    User.findOne({email:value},(err,user)=>{//数据库中寻找是否存在这个用户
        if(user){
            const Match = bcrypt.compareSync(Password,user.InputPassword);//比较密码是否相同
           if(Match){
               if(!req.body.savepsw){
                res.sendFile(__dirname + "/index.html")//密码相同的情况下，跳转至登录后的用户界面
                return;
               }else{
                passport.authenticate('local')(req, res, () => {
                    res.redirect('/login')
                })
               }           
           }
           else{
               res.sendFile(__dirname+"/Error.html")//不相同跳转至密码错误界面
               return;
           }
        }
        else{
            res.sendFile(__dirname+"/None.html")//否则显示不存在这个用户
        }
    })
}
})

//创建用户
app.post('/register', (req, res) => {

    const salt = bcrypt.genSaltSync(saltRounds);
    var password = req.body.password
    password = bcrypt.hashSync(password, salt)
    var Cpassword = req.body.confirmPassword
    Cpassword = bcrypt.hashSync(Cpassword, salt)
    const data = {
        members:[{
            email_address:req.body.email,
            status:"subscribed",
            merge_fields:{
                FNAME:req.body.firstname,
                LNAME:req.body.lastname
            }
        }]
    }
    jsonData = JSON.stringify(data)
    const url = "https://us17.api.mailchimp.com/3.0/lists/bf22be2a86"
    const options = {
        method:"POST",
        auth:"azi:ee958d668174a5df1e063007c1ae5027-us17"
    }
    https.req(url,options,(response)=>{
        response.on("data",(data)=>{
            console.log(JSON.parse(data))
        })
    })

    request.write(jsonData)
    request.end()
    const user = new User({
        firstname:req.body.firstname,
        lastname:req.body.lastname,
        email:req.body.email,
        password:password,
        confirmPassword:Cpassword,
        country:req.body.country,
        city:req.body.city,
        state:req.body.province,
        address:req.body.address,
        address2:req.body.address2,
        number:req.body.number
    })
    user.save((err) => {
        if (err) { console.log(err); res.send("Fail to register") }
        else{
            res.redirect('/login')
        }
    })
})

//lead to another page
app.post('/forgetpassword', (req, res) => {
    res.redirect("forgetpassword")
})


//reset password function
app.post('/reset', (req, res) => {
    User.findOne({ email: req.body.email }, (err, data) => {
        if (err) {
            console.log(err)
            res.send("unexpected error")
            return
        } else if (data.name != req.body.name) {
            res.send("wrong information")
        } else {
            User.updateOne({ email: req.body.email }, { password: req.body.password }, (err, user) => {
                if (err) {
                    res.send("Fail to reset")
                } else {
                    res.send("reset password successfully!")
                }
            })
        }
    })
})

//send reset password link
app.post('/sendemail', function (req, res) {
    mail.send({
        from: '"SIT313" <sit223.group4@gmail.com>',
        to: req.body.email,
        subject: 'SIT313',
        text: 'Reset account password',
        html: '<a href="http://localhost:8000/reset">Please click this link to reset your password</a>'
    });
    res.send("Reset password email has been sent")
});


let port = process.env.PORT;
if (port == null || port == "") {
    port = 8000;
}

app.listen(port, (req, res) => {
    console.log("Server is running successfully")
})
