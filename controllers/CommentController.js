const Comment = require('../models/Comment');
const Resource = require("../models/Resources")
const { body, validationResult } = require("express-validator"); // validator and sanitizer
const asyncHandler = require("express-async-handler")
exports.comment =[
  body("text" , "Required text to post").trim().isLength({min:1}).escape(),
  asyncHandler(async (req, res, next) => {
  const errors = validationResult(req)
  const  {text}  = req.body;
  const resourceId = req.params.id; // Retrieve resourceId from route parameters
  
  if(!errors.isEmpty())
  {
      return res.status(403).json(
          {
              errors : errors.array()
          })
  }
    // Create a new comment and save it to the database, associating it with the specified resource
    const newComment = new Comment({
    Comment: text,
    Resource: resourceId,
    User: req.user._id, // Assuming you have user information available in the request.
    });
    await newComment.save();

    // Return a success response
    return res.status(201).json({ message: 'Comment created successfully' });
})];

exports.Delete_comment = asyncHandler(async(req,res,next)=>
{
  const { resourceId, commentId } = req.params;
  const comment = await Comment.findOne({ _id: commentId, Resource: resourceId }).exec();

  if (!comment) {
    return res.status(404).json({ message: "Comment not found" });
  }

  if (req.user.isAdmin || comment.User._id.toString() === req.user._id.toString()) {
    await Comment.findByIdAndDelete(comment._id);
    return res.status(200).json({ message: "Comment deleted successfully" });
  }

  return res.status(403).json({ message: "Unauthorized to delete this comment" });
})
exports.Update_Comment = [
  body("NewComment", "Required text to post").trim().isLength({ min: 1 }).escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const commentId = req.params.id; // The ID should be the comment's ID, not the resource's ID
    const { NewComment } = req.body; // The updated comment text

    // Find the comment by ID
    const comment = await Comment.findById(commentId).exec();

    if (!comment) {
      console.log(`Comment with ID ${commentId} not found.`);
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if the user making the request matches the user ID associated with the comment
    if (comment.User._id.toString() !== req.user._id.toString()) {
      console.log(`User ${req.user._id} is unauthorized to update comment ${commentId}.`);
      return res.status(403).json({ message: "Unauthorized to Update this Comment" });
    }

    // Update the comment text
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { Comment: NewComment }, // Make sure this matches your schema
      { new: true }
    ).exec();

    if (updatedComment) {
      console.log(`Comment with ID ${commentId} updated successfully.`);
      return res.status(200).json({ message: "Comment Updated successfully", updatedComment });
    } else {
      console.log(`Failed to update comment with ID ${commentId}.`);
      return res.status(500).json({ message: "Failed to update comment" });
    }
  })
];

