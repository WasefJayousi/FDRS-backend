const mongoose = require("mongoose")

const Schema = mongoose.Schema

const userfavresSchema  = new Schema({
    User : {type: Schema.Types.ObjectId  , ref:"User" , required : true},
    Resource : {type:Schema.Types.ObjectId , ref:"Resource" , required:true},
})


module.exports = mongoose.model("UserFavRes" , userfavresSchema)