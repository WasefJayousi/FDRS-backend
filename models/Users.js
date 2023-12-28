const mongoose = require('mongoose');
const{DateTime} = require("luxon")
const Schema = mongoose.Schema;

const userSchema = new Schema({
  Username: { type: String, required: true, maxLength: 12 , unique: true },
  Email: { type: String, required: true, maxLength: 256, minLength: 15, unique: true },
  Password: { type: String, required: true, maxLength: 256, minLength: 8 },
  isAdmin: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  refreshToken: String,
});
userSchema.virtual("Date_formatted").get(function() {

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
const User = mongoose.model('User', userSchema);

module.exports = User;
