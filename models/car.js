const mongoose = require("mongoose")

const CarSchema = new mongoose.Schema(
    {
        vehicleType:String,
        vehicleModel:String,
        vin:String,
        problems:String
    }
)
module.exports = mongoose.model("Car",CarSchema)