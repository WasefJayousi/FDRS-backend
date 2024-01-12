const Resource = require("../models/Resources")
const Faculty = require("../models/Faculty")
const Comment = require("../models/Comment")
const Favorite = require("../models/UserFavRes")
const asyncHandler = require("express-async-handler")
const {body,validationResult} = require("express-validator")
const path  = require("path")
const { upload } = require('../multerconfig');
const { comment } = require("./CommentController")
const fs = require('fs')
const { title } = require("process")


// Get all resources
exports.resource_list = asyncHandler(async (req, res, next) => {
  const FacultyID = req.params.id;
  console.log('Faculty ID received:', FacultyID);

  try {
    const faculty = await Faculty.findById(FacultyID);
    if (!faculty) {
      console.log('Faculty not found');
      return res.status(404).json({ error: 'Faculty not found' });
    }

    const allResources = await Resource.find({ Faculty: faculty._id, isAuthorized: true })
      .sort({ Title: 1 }) // Changed 'title' to 'Title' to match your schema
      .populate("Faculty")
      .populate("User")
      .exec();
    return res.status(200).json({ resource_list: allResources });
  } catch (error) {
    console.error('Error fetching resources:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Display detail page for a specific Resource.
exports.Resource_detail = asyncHandler(async (req, res, next) => {
  // Get details of books, book instances for specific Resource
    const resource = await Resource.findById(req.params.id).populate("Faculty").populate("User").exec()
    const comments =  await Comment.find({Resource : resource._id}).populate("User").exec()
    const numComments = await Comment.countDocuments({ Resource: resource._id });
  if(resource == null)
  {
    // no Results
    return res.status(404).json({ error: 'Resource not found' });
  }
  return res.status(200).json({Resource_details : resource , comments : comments , numcomment : numComments})
});


  
// Handle Resource create on POST.
exports.Resource_create_post = [
  upload.fields([
    { name: 'file', maxCount: 1 }, // PDF file
    { name: 'img', maxCount: 1 },  // Image file
    ]),
  // Validate and sanitize fields.
  body("title", "Title must not be empty!")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .custom(async(title)=>
    {
      try {
        const titleExists = await Resource.findOne({Title:title})
        if(titleExists)
        {
          throw new Error('Resource already exists.')
        }
      } catch (error) {
        throw new error(error)
      }
    }),
  body("firstname", "Author firstname must not be empty!")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("lastname", "Author lastname must not be empty") // Corrected error message
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description", "Description must not be empty")
    .isLength({ min: 1 })
    .escape(),
  body("related_link")
    .trim()
    .escape(),

  // Process request after validation, sanitization, and file uploads.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // There are errors. Return JSON response with error messages.
      console.log({error : req.body})
      return res.status(400).json({ errors: errors.array()});
    }
    try {
      let flag = false
      if(req.user.isAdmin)
      {
        flag = true
      }
      // Create a Resource object with escaped and trimmed data.
      const resource = new Resource({
        User: req.user._id, // Assuming you have a user object with _id
        Faculty: req.params.id,
        Author_first_name:req.body.firstname,
        Author_last_name : req.body.lastname,
        Title: req.body.title,
        isAuthorized: flag, // Default value is set to false
        Description: req.body.description,
        file_path: req.files.file[0].path, // Store the file path
        file_size: req.files.file[0].size, // Store the file size
        Cover: req.files.img[0].path, // Store the image path as ResourceCover
        Related_link: req.body.related_link, // Change to match your request body
      });
      // Save the resource.
      await resource.save();

      // Return a JSON response with the created resource.
      return res.status(201).json({ message : "Resource created successfuly" });

    } catch (err) {
      // Handle any errors that occur during author or resource creation.
      console.log("hhhh");
      console.error(err);
      res.status(500).json({ err:err,error: "Internal Server Error" });
    }
  }),
];


exports.pdf_download = asyncHandler(async (req, res, next) => {
  const UPLOADS_DIR = path.join(__dirname,'..', 'uploads'); // Adjust the path as necessary
  const ResourceId = req.params.id;

  try {
    const resource = await Resource.findById(ResourceId);

    if (!resource) {
      console.error('PDF not found. Resource ID:', ResourceId);
      return res.status(404).json({ message: 'PDF not found.' });
    }


    // Log the file path for debugging purposes
    console.log('File Path:', resource.file_path);

    // Check if the file exists before attempting to download
    if (fs.existsSync(resource.file_path)) {
      res.download(resource.file_path);
    } else {
      console.error('PDF file not found:', resource.file_path);
      // Use the 'next' function to pass the error to the error-handling middleware
      return next({ status: 404, message: 'PDF file not found.' });
    }
  } catch (err) {
    console.error('Error downloading PDF:', err);
    // Use the 'next' function to pass the error to the error-handling middleware
    return next({ status: 500, message: 'Internal server error.' });
  }
});
exports.cover_download = asyncHandler(async (req, res, next) => {
  const UPLOADS_DIR = path.join(__dirname,'..', 'uploads'); // Adjust the path as necessary
  const ResourceId = req.params.id;

  try {
    const resource = await Resource.findById(ResourceId);

    if (!resource) {
      console.error('PDF not found. Resource ID:', ResourceId);
      return res.status(404).json({ message: 'PDF not found.' });
    }


    // Log the file path for debugging purposes
    console.log('File Path:', resource.Cover);

    // Check if the file exists before attempting to download
    if (fs.existsSync(resource.Cover)) {
      res.download(resource.Cover);
    } else {
      console.error('PDF file not found:', resource.Cover);
      // Use the 'next' function to pass the error to the error-handling middleware
      return next({ status: 404, message: 'PDF file not found.' });
    }
  } catch (err) {
    console.error('Error downloading PDF:', err);
    // Use the 'next' function to pass the error to the error-handling middleware
    return next({ status: 500, message: 'Internal server error.' });
  }
});






  
exports.search_resource = asyncHandler(async (req, res, next) => {
  const searchTerm = req.query.term;
  const facultyID = req.params.id
  // Implement your search query based on the searchTerm
  // Search by both author's name and title using a case-insensitive text search
  console.log(searchTerm)
  const searchResults = await Resource.find({
    $and: [
      { Faculty: facultyID }, // Add this line to filter by facultyID
      {
        $or: [
          { Title: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive search for title
          {
            $or: [
              {
                fullname: {
                  $regex: searchTerm,
                  $options: 'i'
                }
              },
              {
                $expr: {
                  $regexMatch: {
                    input: { $concat: ['$Author_first_name', ' ', '$Author_last_name'] },
                    regex: searchTerm,
                    options: 'i'
                  }}
              }]
          }]
      }]
  });


  // Filter out resources with null ResourceAuthor (unpopulated authors)
  if (searchResults.length === 0) {
    console.log(searchResults)
    return res.status(404).json({ message: 'No matching resources found' });
  }
  console.log(searchResults)
  res.status(200).json(searchResults);
});
// Delete resource middleware
exports.deleteResource = asyncHandler(async (req, res, next) => {
  try {
    const resourceId = req.params.id;
    const resource = await Resource.findById(resourceId);

    if (!resource) {
      return res.status(404).json({ message: "Resource does not exist" });
    }

    // Check if the user is an admin or if the resource belongs to the user
    if (req.user.isAdmin || resource.User._id.toString() === req.user._id.toString()) {
      // Deleting the associated favorites and comments
      await Favorite.deleteMany({ Resource: resource._id }).exec();
      await Comment.deleteMany({ Resource: resource._id }).exec();

      // Use deleteOne for better error handling
      const result = await Resource.deleteOne({ _id: resourceId }).exec();

      if (result.deletedCount > 0) {
        return res.status(200).json({ message: "Resource deleted successfully" });
      } else {
        return res.status(500).json({ message: "Failed to delete resource" });
      }
    }

    return res.status(403).json({ message: "Unauthorized to delete this resource" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});
