const mongoose = require("mongoose");
const{DateTime} = require("luxon")
const Schema = mongoose.Schema

const commentSchema = new Schema({
    User : {type: Schema.Types.ObjectId  , ref:"User" , required : true},
    Resource : {type:Schema.Types.ObjectId , ref:"Resource" , required:true},
    Comment : {type:String , required:true , minLength : 3 , maxLength : 100},
    Created_date: {type:Date , default:Date.now},

})

module.exports = mongoose.model("Comment" , commentSchema)