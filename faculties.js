const mongoose = require("mongoose");
const Faculty = require("./models/Faculty"); // Assuming you've exported your model correctly

// Connect to MongoDB (replace with your actual MongoDB URL)
mongoose.connect("mongodb://mongo:e4-C5AC4bgfAGh3gGaaHAF26hFGCe343@viaduct.proxy.rlwy.net:32407", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Array of faculty names
const facultyNames = [
  "Arts and Educational Sciences",
  "Law",
  "Business",
  "Information Technology",
  "Allied Medical Sciences",
  "Engineering",
  "Media",
  "Architecture and Design",
  "Faculty of Pharmacy",
];

// Insert faculty names into the database
async function insertFacultyNames() {
  try {
    // Iterate over the array of faculty names and create documents
    for (const facultyName of facultyNames) {
      const faculty = new Faculty({ FacultyName: facultyName });
      await faculty.save();
      console.log(`Inserted faculty: ${facultyName}`);
    }
    mongoose.connection.close();
    console.log("Database connection closed.");
  } catch (error) {
    console.error("Error inserting faculty names:", error);
  }
}

// Call the function to insert faculty names
insertFacultyNames();