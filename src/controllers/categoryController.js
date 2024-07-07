/***********************************************************************
************ Author:    Christian KEMGANG NGUESSOP *********************
************ Version:    1.0.0                      ********************
***********************************************************************/

const Category = require('../models/categoryModel');
const asyncHandler = require('express-async-handler');
const cloudinary = require("../config/cloudinary");
const { addCategoryBodyValidation, modifyCategoryBodyValidation, getParamsCategoryValidation } = require('../middleware/validationSchema');

// Add category on the database
module.exports.addCategory = asyncHandler(async (req, res) => {
    try {
        const { error } = addCategoryBodyValidation(req.body);
        if (error)
            return res.status(400).json({ error: true, message: error.details[0].message });

        const { name, icon, color } = req.body;
        
        // Check if the category with the same name already exists
        const existingCategory = await Category.findOne({ name }).lean().exec();
        if (existingCategory) 
            return res.status(400).json({ success: false, message: "Category with the same name already exists!" });

        let imageUpload, uploadedResponse;
        if (req.file && req.file.path) {
            imageUpload = req.file.path; // If using multer for file upload
        } else if (req.body.image) {
            imageUpload = req.body.image; // If image data is directly in the request body
        }

        // Upload image to cloudinary if provided
        if (imageUpload) {
            uploadedResponse = await cloudinary.uploader.upload(imageUpload, {
                upload_preset: "dev_categories",
            });
            // Handle error if image upload fails
            if (!uploadedResponse) {
                return res.status(500).json({ success: false, message: "Error uploading user image!" });
            }
        }

        const newCategory = new Category({
            name, icon, color,
            image: uploadedResponse ? uploadedResponse.secure_url : null,
            cloudinary_id: uploadedResponse ? uploadedResponse.public_id : null
        });

        try {
            // Create and store new category 
            const savedCategory = await newCategory.save();
            if (savedCategory)
                return res.status(201).json({ success: true, message: `Category ${name} registered successfully...` });
            return res.status(400).json({ success: false, message: 'The category cannot be created!' });
        } catch (error) {
            // Handle duplicate key error
            console.error('Error adding category:', error);
            if (error.code === 11000) {
                // Check which field caused the duplicate key error
                if (error.keyPattern.name === 1) {
                    await cloudinary.uploader.destroy(newCategory.cloudinary_id);
                    return res.status(400).json({ success: false, message: 'Duplicate name. Please choose a different name.' });
                }
            } else {
                // Handle other errors
                //console.error('An error occurred while inserting the category: ', error);
                return res.status(500).json({ success: false, message: "An error occurred while inserting the category: " + error });
            }
        }
    } catch (err) {
        //console.log(err);
        res.status(500).json({ success: false, message: "Internal Server Error!" });
    }
});


// Get all categories on the database
module.exports.getCategories = asyncHandler(async (req, res) => {
    try {
        const categoryList = await Category.find().lean().exec();

        if (!categoryList)
            return  res.status(404).json({ success: false, message: "Category not found!" })
        res.status(200).json(categoryList);
    } catch (err) {
        //console.log(err);
        res.status(500).json({ success: false, message: "Internal Server Error!" });
    }
});

// Get category on the database
module.exports.getCategory = asyncHandler(async (req, res) => {
    try {
        const { error } = getParamsCategoryValidation(req.params);
        if (error)
            return res.status(400).json({ error: true, message: error.details[0].message });

        const { name } = req.params;
        const category = await Category.findOne({ name }).lean().exec();

        if (!category)
            return  res.status(404).json({ success: false, message: "Category not found!" })
        res.status(200).json(category);
    } catch (err) {
        //console.log(err);
        res.status(500).json({ success: false, message: "Internal Server Error!" });
    }
});

// Modify category on the database
module.exports.modifyCategory = asyncHandler(async (req, res) => {
    try {
        // Validation of request parameters and user modification data
        const { error: paramsError } = getParamsCategoryValidation(req.params);
        const { error: bodyError } = modifyCategoryBodyValidation(req.body);

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

        const { name } = req.params;
        const category = await Category.findOne({ name });
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found!" })  
        }

        // Check for duplicate name
        if (req.body.name && req.body.name !== category.name) {
            const duplicateName = await Category.findOne({ name: req.body.name });
            if (duplicateName) {
                return res.status(400).json({ success: false, message: 'Name already exist!' });
            }
        }

        let imageUpload, imagepath, cld_id, uploadedResponse;
        if (req.file && req.file.path) {
            imageUpload = req.file.path; // If using multer for file upload
        } else if (req.body.image) {
            imageUpload = req.body.image; // If image data is directly in the request body
        }else {
            imagepath = category.image;
            cld_id = category.cloudinary_id;
        }
                        
        if (imageUpload) {
            if (category.cloudinary_id) await cloudinary.uploader.destroy(category.cloudinary_id);
            
            uploadedResponse = await cloudinary.uploader.upload(imageUpload, {
                upload_preset: "dev_categories",
            }).catch(err => {
                //console.error("Error uploading image to Cloudinary:", err);
                return res.status(500).json({ success: false, message: "Error uploading category image!" });
            });

            imagepath = uploadedResponse.secure_url;
            cld_id = uploadedResponse.public_id;
        }

        const data = {
            name: req.body.name || category.name,
            icon: req.body.icon || category.icon,
            color: req.body.color || category.color,
            image: imagepath,
            cloudinary_id: cld_id,
        }

        if (!data) return res.status(400).json({ success: false, message: "The category cannot be updated!" });

        const updatedCategory = await Category.findByIdAndUpdate(
            category._id, data, { new: true }
        );

        if (updatedCategory) {
            return res.status(200).json({ success: true, message: 'Category updated!' });
        } else {
            return res.status(400).json({ success: false, message: 'The category cannot be updated!' });
        }
    } catch (err) {
        //console.log(err);
        res.status(500).json({ success: false, message: "Internal Server Error!" });
    }
});

// Delete category on the database
module.exports.deleteCategory = asyncHandler(async (req, res) => {
    try {
        const { error } = getParamsCategoryValidation(req.params);
        if (error)
            return res.status(400).json({ error: true, message: error.details[0].message });

        const { name } = req.params;
        const category = await Category.findOne({ name });
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found!" })  
        }
        if(category.cloudinary_id)  await cloudinary.uploader.destroy(category.cloudinary_id);
        await category.deleteOne();
        res.status(200).json({ success: true, message: 'Category deleted!' })
    } catch (err) {
        //console.log(err);
        res.status(500).json({ success: false, message: "Internal Server Error!" });
    }
});
