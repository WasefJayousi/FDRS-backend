const asyncHandler = require("express-async-handler");
const FeedBack = require("../models/FeedBack");

exports.feedback = asyncHandler(async (req, res, next) => {
    const searchTerm = req.body.SearchText; // Make sure you're accessing the correct property
  
    if (!searchTerm) {
      return res.status(400).json({ message: "Search term is required." });
    }
  
    try {
      const newFeed = new FeedBack({
        User: req.user._id,
        SearchText: searchTerm,
      });
  
      await newFeed.save();
      return res.status(201).json({ message: "Thank you for your feedback" });
    } catch (error) {
      console.error('Error saving feedback:', error);
      return res.status(500).json({ message: "An error occurred while submitting feedback." });
    }
  });
  
  exports.get_feedbacks = asyncHandler(async (req, res, next) => {
    const feedbacks = await FeedBack.find({}).populate("User").exec(); // Add 'await' to ensure asynchronous operation completes
    if (!feedbacks || feedbacks.length === 0) { // Check if feedbacks is empty
        return res.status(404).json({ message: "No feedbacks found" });
    }
    return res.status(200).json({ feedbacks: feedbacks });
});
exports.deleteFeedback = asyncHandler(async (req, res) => {
  const { feedbackId } = req.params;

  const feedback = await FeedBack.findByIdAndDelete(feedbackId);

  if (!feedback) {
    return res.status(404).json({ message: "Feedback not found" });
  }

  res.status(200).json({ message: "Feedback deleted successfully" });
});

