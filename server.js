const express = require("express")
const bodyParser = require("body-parser")
const Car = require("./models/car");
const User = require("./models/user");
const Link=require("./models/UClink");
const app = express()
const mongoose = require("mongoose")
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))
mongoose.connect("mongodb://localhost:27017/testLink", { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.static("public"))

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

app.post('/search', (req,res)=>{
    const car = await Car.findOne({
        vehicleType:req.body.make,
        vehicleModel:req.body.model
    })
    if(!car) {
        alert("Car model doesn't exist.")
    }
    res.send(car.problems)
})

let port = process.env.PORT;
if(port == null || port == ""){
    port = 8080;
}
app.listen(port, (req,res)=>{
    console.log("Server is running successfully!")
})
