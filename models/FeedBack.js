const mongoose = require("mongoose");

const Schema = mongoose.Schema

const feedbackShema = mongoose.Schema({
    User : {type: Schema.Types.ObjectId  , ref:"User" , required : true},
    SearchText : {type : String , required : true , minLength : 5 , maxLength : 50},
})

module.exports = mongoose.model("FeedBack" , feedbackShema)