const express = require('express');
const UserFavRes = require('../controllers/FavoriteController');
const passport = require('passport');
const router = express.Router();

// Create a route for marking a resource as a favorite
router.post('/resources/:id/favorite',passport.authenticate('jwt', { session: false }),UserFavRes.add_favorite);
router.delete('/resources/:id/unfavorite',passport.authenticate('jwt', { session: false }),UserFavRes.remove_favorite);

module.exports = router;

