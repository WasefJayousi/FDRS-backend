const mongoose = require("mongoose");

const Schema = mongoose.Schema

const facultySchema  = new Schema({
    FacultyName :{type : String}
})



module.exports = mongoose.model("Faculty" , facultySchema)