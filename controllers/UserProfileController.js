const Users = require("../models/Users")
const UserFavs = require('../models/UserFavRes')
const Resource = require('../models/Resources')
const asyncHandler = require("express-async-handler")
const { body, validationResult } = require("express-validator"); // validator and sanitizer
const fsPromises = require("fs").promises
const path = require("path");
const nodemailer = require('nodemailer');



exports.profile = asyncHandler(async (req, res, next) => {
    try {
      const user = await Users.findById(req.user._id).exec();
      const resources = await Resource.find({ User: req.user._id , isAuthorized:true }).populate("User").exec(); 
      const favorites = await UserFavs.find({ User: req.user._id }).populate("Resource").exec(); 
  
      const profileData = {
        profile: user,
        UserResources: resources,
        userFavorites: favorites
      };
  
      res.status(200).json(profileData);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  
exports.resource_authorize = asyncHandler(async(req,res,next)=>
{
    const resource = await Resource.find({isAuthorized:false}).populate("Faculty").populate("User").exec()
    if(!resource)
    {
        return res.status(404).json({message:"no resources available"})
    }
    return res.status(200).json({resource:resource})
})


exports.admin_acceptance = asyncHandler(async (req, res, next) => {
    try {
        let flag = false;
        const btnAccept = req.body.accept;
    
        if (flag !== btnAccept) {
            flag = true;
            const resource = await Resource.findByIdAndUpdate(req.params.id, { isAuthorized: flag }, { new: true }).populate("User").exec();
    
            // Ensure that resource.User is defined and has a populated Email property
            if (resource.User && resource.User.Email) {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'FDRS1697@gmail.com',
                        pass: process.env.pass
                    }
                });
    
                const mailOptions = {
                    from: 'FDRS1697@gmail.com',
                    to: resource.User.Email,
                    subject: 'Resource Approval Status',
                    attachments: [{
                        filename: 'logo.png',
                        path: './LOGO/logo.png',
                        cid: 'logo'
                    }],
                };
    
                // Set the email message based on the value of flag
                if (flag) {
                    mailOptions.text = 'Your resource has been approved.';
                } else {
                    mailOptions.text = 'Your resource has been declined.';
                }
    
                // Use a try-catch block to handle potential asynchronous issues
                try {
                    const info = await transporter.sendMail(mailOptions);
                    console.log('Email sent:', info.response);
                    return res.status(200).json({ accepted: "Resource accepted", data: resource, message: "Email sent to the user" });
                } catch (error) {
                    console.error(error);
                    return res.status(500).json({ message: "Email sending failed. Please try again later." });
                }
            } else {
                return res.status(500).json({ message: "User email not found or empty. Email sending failed." });
            }
        }
    
        const resource = await Resource.findByIdAndDelete(req.params.id).populate("User").exec();
    
        if (!resource) {
            return res.status(404).json({ message: "Resource not found" });
        }
    
        // Assuming resource.file_path contains the full path
        await fsPromises.unlink(resource.file_path);
    
        // Assuming resource.Cover contains the full path
        await fsPromises.unlink(resource.Cover);
    
        // Ensure that resource.User is defined and has a populated Email property
        if (resource.User && resource.User.Email) {
            // Send an email to the user for declined resource
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'FDRS1697@gmail.com',
                    pass: process.env.pass
                }
            });
    
            const mailOptions = {
                from: 'FDRS1697@gmail.com',
                to: resource.User.Email,
                subject: 'Resource Approval Status',
                attachments: [{
                    filename: 'logo.png',
                    path: './LOGO/logo.png',
                    cid: 'logo'
                }],
                text: 'Your resource has been declined.'
            };
    
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ message: "Email sending failed. Please try again later." });
                } else {
                    console.log('Email sent: ' + info.response);
                    return res.status(200).json({ declined: "Resource declined", message: "Email sent to the user" });
                }
            });
        } else {
            return res.status(500).json({ message: "User email not found or empty. Email sending failed." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}) 



exports.updateProfile = [
    body('newUsername', 'New Username must be required')
        .trim()
        .optional()
        .isLength({ min: 1 })
        .escape(),
    body('newEmail', 'New Email must be required')
        .trim()
        .optional()
        .isLength({ min: 1 })
        .escape()
        .isEmail(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(403).json({
                errors: errors.array()
            });
        }

            const user = await Users.findById(req.user._id).exec(); // Assuming you have the user ID available in the request

            if (!user) {
                return res.status(404).json({
                    message: 'User not found'
                });
            }

            // If the new username is provided and different, check if it already exists
            if (req.body.newUsername && req.body.newUsername !== user.Username) {
                const usernameExists = await Users.findOne({ Username: req.body.newUsername });
                if (usernameExists && usernameExists._id.toString() !== req.user._id.toString()) {
                    throw new Error('Username already exists');
                }
                user.Username = req.body.newUsername;
            }

            // If the new email is provided and different, check if it already exists
            if (req.body.newEmail && req.body.newEmail !== user.Email) {
                const emailExists = await Users.findOne({ Email: req.body.newEmail });
                if (emailExists && emailExists._id.toString() !== req.user._id.toString()) {
                    throw new Error('Email already exists');
                }
                user.Email = req.body.newEmail;
            }

            await user.save();

            res.status(200).json({
                message: 'User profile updated successfully.'
            });

    })
];


