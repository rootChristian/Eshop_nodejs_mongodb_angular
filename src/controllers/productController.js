/***********************************************************************
************ Author:    Christian KEMGANG NGUESSOP *********************
************ Version:    1.0.0                      ********************
***********************************************************************/

/***********************************************************************
************ Author:    Christian KEMGANG NGUESSOP *********************
************ Version:    1.0.0                      ********************
***********************************************************************/

const Product = require('../models/ProductModel');
const Category = require('../models/CategoryModel')
const ObjectID = require('mongoose').Types.ObjectId;
const { isValidObjectId } = require('mongoose');
const Joi = require("joi");
const cloudinary = require("../config/cloudinary");
const { addProductBodyValidation } = require('../middleware/validationSchema');

//Add product on the database
module.exports.addProduct = async (req, res) => {
    try {
        const { error } = addProductBodyValidation(req.body);
        if (error)
            return res.status(400).json({ error: true, message: error.details[0].message });

        const { name, description, richDescription, price, image, images, cloudinary_id, size, color, category, countInStock, rating, isFeatured } = req.body;

        const existProduct = await Product.findOne({ name });
        if (existProduct) return res.status(400).json({ errorMessage: "Product already exist!", });

        if (!isValidObjectId(req.body.category)) return res.status(500).json({ success: false, message: 'Invalid ID: ' + req.body.category })

        const existCategory = await Category.findById(category)
        if (!existCategory) return res.status(400).json({ errorMessage: "Category not found!", });

        //const pathName = req.file.path;

        const uploadedResponse = await cloudinary.uploader.upload(req.body.image, {
            upload_preset: "dev_products",
        });

        if (uploadedResponse) {
            const newProduct = new Product({
                name,
                description,
                richDescription,
                price,
                image: uploadedResponse.secure_url,
                images,
                cloudinary_id: uploadedResponse.public_id,
                size,
                color,
                category,
                countInStock,
                rating,
                isFeatured
            });

            if (!newProduct) return res.status(500).send('The product cannot be created!');

            await newProduct.save();
            res.status(200).json({ newProduct });
        }
    } catch (err) {
        res.status(500).json({ message: err });
        console.log(err);
    }
};

//Get products on the database
/*module.exports.getProducts = async (req, res) => {

    const queryNew = req.query.limit;

    try {
        let products;

        if (queryNew) products = await Product.find().sort({ createdAt: -1 }).limit(6);
        else products = await Product.find();

        res.status(200).json(products);

    } catch (err) {
        res.status(500).json({ message: err });
        console.log(err);
    }
};*/

//Get product on the database
/*module.exports.getProduct = async (req, res) => {
    if (!isValidObjectId(req.params.id))
        return res.status(500).json({ success: false, message: 'Invalid ID: ' + req.params.id })
    try {
        const product = await Product.findById(req.params.id);

        if (!product)
            return res.status(404).json({ success: false, message: "Product not found!" })
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ message: err });
        console.log(err);
    }
};*/

//Get products by category
/*module.exports.productByCategory = async (req, res) => {
    const idCategory = req.params.id;

    try {
        if (!isValidObjectId(idCategory)) return res.status(500).json({ success: false, message: 'Invalid ID: ' + idCategory })

        const existCategory = await Category.findById(idCategory)
        if (!existCategory) return res.status(400).json({ errorMessage: "Category not found!", });

        const byCategory = await Product.find({ category: existCategory });

        if (byCategory) res.status(200).json(byCategory);

    } catch (err) {
        res.status(500).json({ message: err });
        console.log(err);
    }
};*/

//Modify product on the database
/*module.exports.modifyProduct = async (req, res) => {

    const idProduct = req.params.id;

    try {

        const schema = Joi.object({
            name: Joi.string().min(3).max(20),
            description: Joi.string().min(3).max(200),
            quantity: Joi.number().min(1).max(1000),
            price: Joi.number().min(1).max(1000),
            image: Joi.string().dataUri(),
            category: Joi.string(),
            size: Joi.array().items(Joi.string()),
            color: Joi.array().items(Joi.string()),
            inStock: Joi.boolean(),
        });

        const { error } = schema.validate(req.body);

        if (error) return res.status(400).send(error.details[0].message);

        if (!isValidObjectId(idProduct)) res.status(500).json({ success: false, message: 'Invalid ID: ' + idProduct })

        let product = await Product.findById(req.params.id);

        let imagepath, cld_id, uploadedResponse;

        if ((req?.file === "") || (req?.file === undefined)) {

            imagepath = product.image;
            cld_id = product.cloudinary_id;

        } else {
            await cloudinary.uploader.destroy(product.cloudinary_id);

            const uploadedResponse = await cloudinary.uploader.upload(req.body.image, {
                upload_preset: "dev_products",
            });

            imagepath = uploadedResponse.secure_url;
            cld_id = uploadedResponse.public_id;
        }

        let getCat;
        if (req.body.category) {
            let category = await Category.findById(req.body.category);

            if (category)
                getCat = req.body.category;
            else
                return res.status(404).json({ success: false, message: "Category not found!" })
        }

        const data = {
            name: req.body.name || product.name,
            description: req.body.description || product.description,
            quantity: req.body.quantity || product.quantity,
            price: req.body.price || product.price,
            image: imagepath,
            cloudinary_id: cld_id,
            category: getCat,
            size: req.body.size || product.size,
            color: req.body.color || product.color,
            inStock: req.body.inStock || product.inStock,
        }

        if (!data) return res.status(500).send('The Product cannot be updated!');

        const updatedProduct = await Product.findByIdAndUpdate(
            idProduct, data, { new: true }
        );

        const message = "Product updated!";
        res.status(200).json(message);

    } catch (err) {
        res.status(500).json({ message: err });
        console.log(err);
    }
};*/

//Delete product on the database
/*module.exports.deleteProduct = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id))
            res.status(500).json({ message: 'Invalid ID: ' + req.params.id })

        let product = await Product.findById(req.params.id);
        if (product) {
            await cloudinary.uploader.destroy(product.cloudinary_id);
            await product.remove();
            return res.status(200).json({ success: true, message: 'Product deleted!' })
        } else {
            return res.status(404).json({ success: false, message: "Product not found!" })
        }
    } catch (err) {
        res.status(500).json({ message: err });
        console.log(err);
    }
};*/
