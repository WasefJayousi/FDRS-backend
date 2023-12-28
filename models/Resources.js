const mongoose = require('mongoose')
const {DateTime} = require("luxon")
const schema = mongoose.Schema

const ResourceSchema = new schema({
    User:{type:mongoose.Schema.Types.ObjectId , ref:"User" , required:true},
    Faculty:{type:mongoose.Schema.Types.ObjectId , ref:"Faculty" ,required:true},
    Title:{type:String , required:true},
    Author_first_name:{type:String , required:true},
    Author_last_name:{type:String , required:true},
    isAuthorized:{type:Boolean,default:false},
    Description:{type:String , required:true , minLength:10 , maxLength:500},
    file_path: { type: String, required: true },
    file_size: { type: Number, required: true },
    Cover: { type: String },
    Related_link:{type:String},
    created_at : {type:Date , default:Date.now}
})

// Add indexes for efficient searching
ResourceSchema.index({ Author_first_name: 1 });
ResourceSchema.index({ Author_last_name: 1 });
ResourceSchema.index({ Title: 'text' }); // Text index for searching titles

ResourceSchema.virtual("Date_formatted").get(function() {

    const date = DateTime.fromJSDate(this.created_at);
  
    // Get the day, month, and year components
    const day = date.day;
    const month = date.toFormat('LLL'); // Format the month as a short name, e.g., "Oct"
    const year = date.year;
    
    let daySuffix = '';
    if (day === 1 || day === 21 || day === 31) {
      daySuffix = 'st';
    } else if (day === 2 || day === 22) {
      daySuffix = 'nd';
    } else if (day === 3 || day === 23) {
      daySuffix = 'rd';
    } else {
      daySuffix = 'th';
    }
  
    return `${month} ${day}${daySuffix}, ${year}`;
  });
  // You should declare the `fullname` variable using the `let` keyword to avoid a reference error.
  ResourceSchema.virtual("fullname").get(function () {
    let fullname = "";
    if (this.Author_first_name && this.Author_last_name) {
      fullname = `${this.Author_first_name} ${this.Author_last_name}`;
    }
    return fullname;
  });


module.exports = mongoose.model("Resource", ResourceSchema);