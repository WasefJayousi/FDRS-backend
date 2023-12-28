const express = require('express');
const Faculties = require("../models/Faculty")
const asyncHandler = require("express-async-handler")
const router = express.Router();



/* GET users listing. */
router.get('/Faculties', asyncHandler(async (req, res, next) => {
    const Faculty_Names = await Faculties.find({});
    if (!Faculty_Names) {
      return res.status(404).json({ message: "No faculties in the database" });
    } else {
      // Return the faculty names if found
      res.json({ facultyNames: Faculty_Names });
    }
  }));

module.exports = router;
