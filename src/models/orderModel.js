/***********************************************************************
************ Author:    Christian KEMGANG NGUESSOP *********************
************ Version:    1.0.0                      ********************
***********************************************************************/

const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
    {
        orderItems: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'OrderItem',
            required: true
        }],
        shippingAddress1: {
            type: String,
            required: true,
        },
        shippingAddress2: {
            type: String,
        },
        city: {
            type: String,
            required: true,
        },
        zip: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
            default: 'Pending',
        },
        totalPrice: {
            type: Number,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    },
    {
        timestamps: true,
    }
);

orderSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

orderSchema.set('toJSON', {
    virtuals: true,
});

exports.Order = mongoose.model('Order', orderSchema);

/*currentTime: ()=> Date.now() 
EXAMPLE OF ORDER
{
    "orderItems" : [
        {
            "quantity": 1,
            "product" : "61782f5401c32ef706a95544"
        },
        {
            "quantity": 2,
            "product" : "6177f94e1375a0fe563d0e16"
        }
    ],
    "shippingAddress1" : "Flowers Street , 45",
    "shippingAddress2" : "1-B",
    "city": "Prague",
    "zip": "00000",
    "country": "Czech Republic",
    "phone": "+420702241333",
    "user": "617828662dfe1aa640cb6b6a"
}
*/