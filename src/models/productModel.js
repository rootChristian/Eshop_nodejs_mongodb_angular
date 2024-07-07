/***********************************************************************
************ Author:    Christian KEMGANG NGUESSOP *********************
************ Version:    1.0.0                      ********************
***********************************************************************/

const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please provide unique product name"],
            unique: [true, "Product name exist"],
            minlength: 3,
            maxlength: 50
        },
        description: {
            type: String,
            required: [true, "Please provide unique description"],
            unique: [true, "Description exist"],
            minlength: 5,
            maxlength: 100
        },
        richDescription: {
            type: String,
            default: null
        },
        price: {
            type: Number,
            minlength: 1,
            maxlength: 1000,
            required: true
        },
        image: {
            type: String,
            default: null
        },
        images: [{
            type: String,
            default: null
        }],
        cloudinary_id: {
            type: String,
            default: null
        },
        size: {
            type: [String],
            default: null
        },
        color: {
            type: [String],
            default: null
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true
        },
        countInStock: {
            type: Number,
            required: true,
            min: 0,
            max: 255
        },
        rating: {
            type: Number,
            default: 0,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: true,
    }
);

productSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

productSchema.set('toJSON', {
    virtuals: true,
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;