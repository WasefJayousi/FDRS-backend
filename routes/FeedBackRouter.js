const express = require('express');
const FeedBack = require('../controllers/FeedbackController');
const passport = require('passport');
const router = express.Router();

const isAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        return next();
    }
    return res.status(403).json({ message: "Not authorized. Admin access required." });
};

router.post("/FeedBack-post" , passport.authenticate('jwt', { session: false }) ,FeedBack.feedback)
router.get("/feedbacks" , passport.authenticate('jwt', { session: false }) , isAdmin , FeedBack.get_feedbacks)
router.delete('/delete-feedback/:feedbackId',passport.authenticate('jwt', { session: false }) , isAdmin , FeedBack.deleteFeedback);


module.exports = router;