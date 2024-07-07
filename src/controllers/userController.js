/***********************************************************************
************ Author:    Christian KEMGANG NGUESSOP *********************
************ Version:    1.0.0                      ********************
***********************************************************************/

const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const argon2 = require('argon2');
const cloudinary = require("../config/cloudinary");
const { signUpBodyValidation, modifyUserBodyValidation, getParamsUserValidation } = require('../middleware/validationSchema');

// Add user on the database
module.exports.addUser = asyncHandler(async (req, res) => {
    try {
        const { error } = signUpBodyValidation(req.body);
        
        if (error)  
            return res.status(400).json({ error: true, message: error.details[0].message });

        const { username, email, password, firstname, lastname, phone, image, role, active, street, apartment, zip_code, city, country } = req.body

        // Check for duplicate username
        const duplicateUsername = await User.findOne({ username }).lean().exec();
        if (duplicateUsername) {
            return res.status(400).json({ success: false, message: 'Username already exist!' });
        }

        // Check for duplicate email
        const duplicateEmail = await User.findOne({ email }).lean().exec()
        if (duplicateEmail) {
            return res.status(400).json({ success: false, message: 'Email already exist!' });
        }

        // Hash password 
        const hashPwd = await argon2.hash(password);

        let imageUpload, uploadedResponse;
        if (req.file && req.file.path) {
            imageUpload = req.file.path; // If using multer for file upload
        } else if (req.body.image) {
            imageUpload = req.body.image; // If image data is directly in the request body
        }

        // Upload image to cloudinary if provided
        if (imageUpload) {
            uploadedResponse = await cloudinary.uploader.upload(imageUpload, {
                upload_preset: "dev_users",
            });
            // Handle error if image upload fails
            if (!uploadedResponse) {
                return res.status(500).json({ success: false, message: "Error uploading user image!" });
            }
        }

        const newUser = new User({
            username, email, password: hashPwd, firstname, lastname, phone,
            image: uploadedResponse ? uploadedResponse.secure_url : null,
            cloudinary_id: uploadedResponse ? uploadedResponse.public_id : null,
            role, active, street, apartment, zip_code, city, country
        });

        try {
            // Create and store new user 
            const savedUser = await newUser.save();
            if (savedUser)
                return res.status(201).json({ success: true, message: `User ${username} registered successfully...` });
            return res.status(400).json({ success: false, message: 'The user cannot be created!' });
        } catch (error) {
            // Handle duplicate key error
            console.error('Error adding user:', error);
            if (error.code === 11000) {
                // Check which field caused the duplicate key error
                if (error.keyPattern.username === 1) {
                    await cloudinary.uploader.destroy(newUser.cloudinary_id);
                    return res.status(400).json({ success: false, message: 'Duplicate username. Please choose a different username.' });
                } else if (error.keyPattern.email === 1) {
                    await cloudinary.uploader.destroy(newUser.cloudinary_id);
                    return res.status(400).json({ success: false, message: 'Duplicate email. Please use a different email address.' });
                }
            } else {
                // Handle other errors
                //console.error('An error occurred while inserting the user: ', error);
                return res.status(500).json({ success: false, message: "An error occurred while inserting the user: " + error });
            }
        }
    } catch (err) {
        //console.log(err);
        res.status(500).json({ success: false, message: "Internal Server Error!" });
    }
});

// Get all users on the database
module.exports.getUsers = asyncHandler(async (req, res) => {
    try {
        const userList = await User.find().select('-password').lean().exec();

        if (!userList)
            return  res.status(404).json({ success: false, message: "Users not found!" })
        res.status(200).json(userList);
    } catch (err) {
        //console.log(err);
        res.status(500).json({ success: false, message: "Internal Server Error!" });
    }
});

// Get user on the database
module.exports.getUser = asyncHandler(async (req, res) => {
    try {
        const { error } = getParamsUserValidation(req.params);
        if (error)
            return res.status(400).json({ error: true, message: error.details[0].message });

        const { username } = req.params;
        const user = await User.findOne({ username }).select('-password').lean().exec();

        if (!user)
            return  res.status(404).json({ success: false, message: "User not found!" })
        res.status(200).json(user);
    } catch (err) {
        //console.log(err);
        res.status(500).json({ success: false, message: "Internal Server Error!" });
    }
});

// Modify user on the database
module.exports.modifyUser = asyncHandler(async (req, res) => {
    try {
        // Validation of request parameters and user modification data
        const { error: paramsError } = getParamsUserValidation(req.params);
        const { error: bodyError } = modifyUserBodyValidation(req.body);

        // Checking validation errors
        if (paramsError || bodyError) {
            let errors = [];
            if (paramsError) {
                errors = [...errors, ...paramsError.details.map(detail => detail.message)];
            }
            if (bodyError) {
                errors = [...errors, ...bodyError.details.map(detail => detail.message)];
            }
            return res.status(400).json({ success: false, message: errors[0] });
        }

        const { username } = req.params;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        // Check for duplicate username and email
        if (req.body.username && req.body.username !== user.username) {
            const duplicateUsername = await User.findOne({ username: req.body.username });
            if (duplicateUsername) {
                return res.status(400).json({ success: false, message: 'Username already exist!' });
            }
        }

        if (req.body.email && req.body.email !== user.email) {
            const duplicateEmail = await User.findOne({ email: req.body.email });
            if (duplicateEmail) {
                return res.status(400).json({ success: false, message: 'Email already exist!' });
            }
        }

        // Hash password if provided in request
        let hashPwd;
        if (req.body.password)  hashPwd = await argon2.hash(req.body.password);

        // Management of user profile image updates
        let imageUpload, imagepath, cld_id, uploadedResponse;
        if (req.file && req.file.path) {
            imageUpload = req.file.path; // If using multer for file upload
        } else if (req.body.image) {
            imageUpload = req.body.image; // If image data is directly in the request body
        } else {
            imagepath = user.image;
            cld_id = user.cloudinary_id;
        }

        // Upload the new image to Cloudinary and delete the old one
        if (imageUpload) {
            if (user.cloudinary_id) {
                await cloudinary.uploader.destroy(user.cloudinary_id);
            }
            
            uploadedResponse = await cloudinary.uploader.upload(imageUpload, {
                upload_preset: "dev_users",
            }).catch(err => {
                return res.status(500).json({ success: false, message: "Error uploading user image!" });
            });

            imagepath = uploadedResponse.secure_url;
            cld_id = uploadedResponse.public_id;
        }

        const data = {
            username: req.body.username || user.username,
            email: req.body.email || user.email,
            password: hashPwd || user.password,
            firstname: req.body.firstname || user.firstname,
            lastname: req.body.lastname || user.lastname,
            phone: req.body.phone || user.phone,
            image: imagepath,
            cloudinary_id: cld_id,
            role: req.body.role || user.role,
            active: req.body.active || user.active,
            street: req.body.street || user.street,
            apartment: req.body.apartment || user.apartment,
            zip_code: req.body.zip_code || user.zip_code,
            city: req.body.city || user.city,
            country: req.body.country || user.country
        };

        if (!data) return res.status(400).json({ success: false, message: "The user cannot be updated!" });

        const updatedUser = await User.findByIdAndUpdate(
            user._id, data, { new: true }
        );

        if (updatedUser) {
            return res.status(200).json({ success: true, message: 'User updated!' });
        } else {
            return res.status(400).json({ success: false, message: 'The user cannot be updated!' });
        }
    } catch (err) {
        //console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error!" });
    }
});

// Delete user on the database
module.exports.deleteUser = asyncHandler(async (req, res) => {
    try {

        const { error } = getParamsUserValidation(req.params);
        if (error)
            return res.status(400).json({ error: true, message: error.details[0].message });

        const { username } = req.params;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found!" })  
        }
        if(user.cloudinary_id)  await cloudinary.uploader.destroy(user.cloudinary_id);
        await user.deleteOne();
        res.status(200).json({ success: true, message: 'User deleted!' })
    } catch (err) {
        //console.log(err);
        res.status(500).json({ success: false, message: "Internal Server Error!" });
    }
});

//Get total user on the database
module.exports.getCount = asyncHandler(async (req, res) => {
    try {
        let totalUsers = await User.countDocuments({}).lean().exec();

        if (totalUsers) {
            return  res.status(200).json({ success: true, totalUsers });
        }
        res.status(404).json({success: false, message: "Empty user!" });
        
    } catch (err) {
        //console.log(err);
        res.status(500).json({ success: false, message: "Internal Server Error!" });
    }
});
