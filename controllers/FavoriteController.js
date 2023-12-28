const UserFavRes = require("../models/UserFavRes")
const asyncHandler = require("express-async-handler")

exports.add_favorite = asyncHandler(async (req, res, next) => {
    const userId = req.user._id; // Assuming you have user information available in the request.
    const resourceId = req.params.id;

    // Create a new UserFavRes document to represent the favorite relationship
    const newFavorite = new UserFavRes({
      User: userId,
      Resource: resourceId,
    });

    // Save the favorite relationship to the database
    await newFavorite.save();

    // Return a success response
    res.status(201).json({ message: 'Resource marked as a favorite' });
  })

exports.remove_favorite =  asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const resourceId = req.params.id;

  // Find and remove the UserFavRes document that represents the favorite relationship
  await UserFavRes.findOneAndDelete({ User: userId, Resource: resourceId });

  res.status(200).json({ message: 'Resource removed from favorites' });
})