/***********************************************************************
************ Author:    Christian KEMGANG NGUESSOP *********************
************ Version:    1.0.0                      ********************
***********************************************************************/

const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const asyncHandler = require('express-async-handler');
const cloudinary = require("../config/cloudinary");
const { addProductBodyValidation, modifyProductBodyValidation, getParamsProductValidation } = require('../middleware/validationSchema');

//Add product on the database
module.exports.addProduct = asyncHandler(async (req, res) => {
    try {
        const { error } = addProductBodyValidation(req.body);
        if (error)
            return res.status(400).json({ error: true, message: error.details[0].message });

        const { name, description, richDescription, price, images, size, color, category, countInStock, rating, isFeatured } = req.body;

        // Check if the product with the same name already exists
        const existingProductName = await Product.findOne({ name }).lean().exec();
        if (existingProductName) 
            return res.status(400).json({ success: false, message: "Product with the same name already exists!" });

        // Check if the product with the same description already exists
        const existingProductDescription = await Product.findOne({ description }).lean().exec();
        if (existingProductDescription) {
            return res.status(400).json({ success: false, message: 'Description already exist!' });
        }

        const getCat = await Category.findOne({ name: category });
        if (!getCat) {
            return res.status(404).json({ success: false, message: "Category not found!" })  
        }

        let imageUpload, uploadedResponse;
        if (req.file && req.file.path) {
            imageUpload = req.file.path; // If using multer for file upload
        } else if (req.body.image) {
            imageUpload = req.body.image; // If image data is directly in the request body
        }

        // Upload image to cloudinary if provided
        if (imageUpload) {
            uploadedResponse = await cloudinary.uploader.upload(imageUpload, {
                upload_preset: "dev_products",
            });
            // Handle error if image upload fails
            if (!uploadedResponse) {
                return res.status(500).json({ success: false, message: "Error uploading user image!" });
            }
        }

        const newProduct = new Product({
            name, description, richDescription, price,
            image: uploadedResponse ? uploadedResponse.secure_url : null, images,
            cloudinary_id: uploadedResponse ? uploadedResponse.public_id : null,
            size, color, category: getCat._id, countInStock, rating, isFeatured
        });

        try {
            // Create and store new product 
            const savedProduct = await newProduct.save();
            if (savedProduct)
                return res.status(201).json({ success: true, message: `Product ${name} registered successfully...` });
            return res.status(400).json({ success: false, message: 'The product cannot be created!' });
        } catch (error) {
            // Handle duplicate key error
            console.error('Error adding product:', error);
            if (error.code === 11000) {
                // Check which field caused the duplicate key error
                if (error.keyPattern.name === 1) {
                    await cloudinary.uploader.destroy(newProduct.cloudinary_id);
                    return res.status(400).json({ success: false, message: 'Duplicate name. Please choose a different name.' });
                } else if (error.keyPattern.description === 1) {
                    await cloudinary.uploader.destroy(newProduct.cloudinary_id);
                    return res.status(400).json({ success: false, message: 'Duplicate description. Please use a different description.' });
                }
            } else {
                // Handle other errors
                //console.error('An error occurred while inserting the product: ', error);
                return res.status(500).json({ success: false, message: "An error occurred while inserting the product: " + error });
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Internal Server Error!" });
    }
});

// Get all products on the database
module.exports.getProducts = asyncHandler(async (req, res) => {
    try {
        // Filter by category name if specified in the query. example: {{url}}/products?categories=électroniques,ménagers
        let filter = {};
        const { categories } = req.query;
       
        if (categories) {
            // Separate category names into an array
            const listCategories = categories.split(',');

            // Check if all category names are valid
            if (!listCategories.every(category => /^[a-zA-Z0-9]{3,50}$/.test(category))) {
                return res.status(400).json({ error: true, message: 'The categories parameter must be a list of alphanumeric character strings between 3 and 50 characters long.' });
            }

            const categoryNames = await Category.find({ name: { $in: listCategories } });

            if (categoryNames?.length !== listCategories?.length) {
                return res.status(404).json({ success: false, message: "One or more categories not found!" });
            }

            const categoryIds = categoryNames.map(category => category._id);
            // Add a filter by category ID
            filter.category = { $in: categoryIds };
        }

        const productList = await Product.find(filter).populate('category').sort({ createdAt: -1 }).lean().exec();

        if (!productList || productList?.length === 0) {
            return res.status(404).json({ success: false, message: "Product not found!" });
        }
        res.status(200).json(productList);
    } catch (err) {
        //console.log(err);
        res.status(500).json({ success: false, message: "Internal Server Error!" });
    }
});

//Get product on the database
module.exports.getProduct = asyncHandler(async (req, res) => {
    try {
        const { error } = getParamsProductValidation(req.params);
        if (error)
            return res.status(400).json({ error: true, message: error.details[0].message });

        const { name } = req.params;
        const product = await Product.findOne({ name }).lean().exec();

        if (!product)
            return  res.status(404).json({ success: false, message: "Product not found!" })
        res.status(200).json(product);
    } catch (err) {
        //console.log(err);
        res.status(500).json({ success: false, message: "Internal Server Error!" });
    }
});

// Modify product on the database
module.exports.modifyProduct = asyncHandler(async (req, res) => {
    try {
        // Validation of request parameters and user modification data
        const { error: paramsError } = getParamsProductValidation(req.params);
        const { error: bodyError } = modifyProductBodyValidation(req.body);

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
        const product = await Product.findOne({ name });

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found!" });
        }

        // Check for duplicate name and description
        if (req.body.name && req.body.name !== product.name) {
            const duplicateName = await Product.findOne({ name: req.body.name });
            if (duplicateName) {
                return res.status(400).json({ success: false, message: 'Product already exist!' });
            }
        }

        if (req.body.description && req.body.description !== product.description) {
            const duplicateDescription = await Product.findOne({ description: req.body.description });
            if (duplicateDescription) {
                return res.status(400).json({ success: false, message: 'Description already exist!' });
            }
        }

        let getCategoryId;
        if (req.body.category) {
            const category = await Category.findOne({name: req.body.category});

            if (category) {
                getCategoryId = category.id;
            } else{
                return res.status(404).json({ success: false, message: "Category not found!" })
            }
        }

        // Management of user profile image updates
        let imageUpload, imagepath, cld_id, uploadedResponse;
        if (req.file && req.file.path) {
            imageUpload = req.file.path; // If using multer for file upload
        } else if (req.body.image) {
            imageUpload = req.body.image; // If image data is directly in the request body
        } else {
            imagepath = product.image;
            cld_id = product.cloudinary_id;
        }

        // Upload the new image to Cloudinary and delete the old one
        if (imageUpload) {
            if (product.cloudinary_id) {
                await cloudinary.uploader.destroy(product.cloudinary_id);
            }
            
            uploadedResponse = await cloudinary.uploader.upload(imageUpload, {
                upload_preset: "dev_products",
            }).catch(err => {
                return res.status(500).json({ success: false, message: "Error uploading user image!" });
            });

            imagepath = uploadedResponse.secure_url;
            cld_id = uploadedResponse.public_id;
        }

        const data = {
            name: req.body.name || product.name,
            description: req.body.description || product.description,
            richDescription: req.body.richDescription || product.richDescription,
            price: req.body.price || product.price,
            image: imagepath,
            images: req.body.images || product.images,
            cloudinary_id: cld_id,
            size: req.body.size || product.size,
            color: req.body.color || product.color,
            category: getCategoryId,
            countInStock: req.body.countInStock || product.countInStock,
            rating: req.body.rating || product.rating,
            isFeatured: req.body.isFeatured || product.isFeatured
        }

        if (!data) return res.status(400).json({ success: false, message: "The product cannot be updated!" });

        const updatedProduct = await Product.findByIdAndUpdate(
            product._id, data, { new: true }
        );

        if (updatedProduct) {
            return res.status(200).json({ success: true, message: 'Product updated!' });
        } else {
            return res.status(400).json({ success: false, message: 'The product cannot be updated!' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error!" });
    }
});

// Delete product on the database
module.exports.deleteProduct = asyncHandler(async (req, res) => {
    try {

        const { error } = getParamsProductValidation(req.params);
        if (error)
            return res.status(400).json({ error: true, message: error.details[0].message });

        const { name } = req.params;
        const product = await Product.findOne({ name });
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found!" })  
        }
        if(product.cloudinary_id)  await cloudinary.uploader.destroy(product.cloudinary_id);
        await product.deleteOne();
        res.status(200).json({ success: true, message: 'Product deleted!' })
    } catch (err) {
        //console.log(err);
        res.status(500).json({ success: false, message: "Internal Server Error!" });
    }
});


//Get total product on the database
module.exports.getCount = asyncHandler(async (req, res) => {
    try {
        let productCount = await Product.countDocuments({}).lean().exec();

        if (productCount) {
            return  res.status(200).json({ success: true, productCount });
        }
        res.status(404).json({success: false, message: "Empty product!" });
        
    } catch (err) {
        //console.log(err);
        res.status(500).json({ success: false, message: "Internal Server Error!" });
    }
});

//Get featured product on the database
module.exports.getFeatured = asyncHandler(async (req, res) => {
    try {
        const count = req.params.count ? req.params.count : 0
        const products = await Product.find({isFeatured: true}).limit(+count);

        if(!products?.length) { 
            return  res.status(404).json({success: false, message: "Empty featured!" });
        }
        res.status(200).json({ success: true, products });
    } catch (err) {
        //console.log(err);
        res.status(500).json({ success: false, message: "Internal Server Error!" });
    }
});
