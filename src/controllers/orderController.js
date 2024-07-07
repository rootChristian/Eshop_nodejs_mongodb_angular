/***********************************************************************
************ Author:    Christian KEMGANG NGUESSOP *********************
************ Version:    1.0.0                      ********************
***********************************************************************/

const Order = require('../models/orderModel');
const asyncHandler = require('express-async-handler');
const cloudinary = require("../config/cloudinary");
const { addCategoryBodyValidation, modifyCategoryBodyValidation, getParamsCategoryValidation } = require('../middleware/validationSchema');

// Add order on the database
module.exports.addOrder = asyncHandler(async (req, res) => {
    try {
        const { error } = addCategoryBodyValidation(req.body);
        if (error)
            return res.status(400).json({ error: true, message: error.details[0].message });

        const { name, icon, color } = req.body;
        
        // Check if the order with the same name already exists
        const existingOrder = await Order.findOne({ name }).lean().exec();
        if (existingOrder) 
            return res.status(400).json({ success: false, message: "Order with the same name already exists!" });


        const newOrder = new Order({
            name,
        });

        // Create and store new order 
        const savedOrder = await newOrder.save();
        if (savedOrder)
            return res.status(201).json({ success: true, message: `Order ${name} registered successfully...` });
        return res.status(400).json({ success: false, message: 'The order cannot be created!' });
    } catch (err) {
        //console.log(err);
        res.status(500).json({ success: false, message: "Internal Server Error!" });
    }
});


// Get all orders on the database
module.exports.getOrders = asyncHandler(async (req, res) => {
    try {
        const orderList = await Order.find().lean().exec();

        if (!orderList)
            return  res.status(404).json({ success: false, message: "Order not found!" })
        res.status(200).json(orderList);
    } catch (err) {
        //console.log(err);
        res.status(500).json({ success: false, message: "Internal Server Error!" });
    }
});

// Get order on the database
module.exports.getOrder = asyncHandler(async (req, res) => {
    try {
        const { error } = getParamsCategoryValidation(req.params);
        if (error)
            return res.status(400).json({ error: true, message: error.details[0].message });

        const { name } = req.params;
        const order = await Order.findOne({ name }).lean().exec();

        if (!order)
            return  res.status(404).json({ success: false, message: "Order not found!" })
        res.status(200).json(order);
    } catch (err) {
        //console.log(err);
        res.status(500).json({ success: false, message: "Internal Server Error!" });
    }
});

// Modify order on the database
module.exports.modifyOrder = asyncHandler(async (req, res) => {
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
        const order = await Order.findOne({ name });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found!" })  
        }

        // Check for duplicate name
        if (req.body.name && req.body.name !== order.name) {
            const duplicateName = await Order.findOne({ name: req.body.name });
            if (duplicateName) {
                return res.status(400).json({ success: false, message: 'Name already exist!' });
            }
        }

        const data = {
            name: req.body.name || order.name,
        }

        if (!data) return res.status(400).json({ success: false, message: "The order cannot be updated!" });

        const updatedOrder = await Order.findByIdAndUpdate(
            order._id, data, { new: true }
        );

        if (updatedOrder) {
            return res.status(200).json({ success: true, message: 'Order updated!' });
        } else {
            return res.status(400).json({ success: false, message: 'The order cannot be updated!' });
        }
    } catch (err) {
        //console.log(err);
        res.status(500).json({ success: false, message: "Internal Server Error!" });
    }
});

// Delete order on the database
module.exports.deleteOrder = asyncHandler(async (req, res) => {
    try {
        const { error } = getParamsCategoryValidation(req.params);
        if (error)
            return res.status(400).json({ error: true, message: error.details[0].message });

        const { name } = req.params;
        const order = await Order.findOne({ name });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found!" })  
        }

        res.status(200).json({ success: true, message: 'Order deleted!' })
    } catch (err) {
        //console.log(err);
        res.status(500).json({ success: false, message: "Internal Server Error!" });
    }
});
