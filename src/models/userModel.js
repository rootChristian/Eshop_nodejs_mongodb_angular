/***********************************************************************
************ Author:    Christian KEMGANG NGUESSOP *********************
************ Version:    1.0.0                      ********************
***********************************************************************/

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please provide unique name"],
            unique: [true, "Name exist"],
            minlength: 3,
            maxlength: 50
        },
        email: {
            type: String,
            required: [true, "Please provide a unique email"],
            unique: [true, "Email exist"],
            minlength: 5,
            maxlength: 50
        },
        password: {
            type: String,
            required: [true, "Please provide a password"],
            unique: false,
            minlength: 8,
            maxlength: 1024
        },
        phone: {
            type: String,
            required: true,
        },
        cloudinary_id: {
            type: String,
        },
        role: {
            type: String,
            minlength: 4,
            maxlength: 5,
            enum: ['ROOT', 'ADMIN', 'USER'],
            default: 'USER'
        },
        /*isAdmin: {
            type: Boolean,
            default: false,
        },*/
        street: {
            type: String,
            default: ''
        },
        apartment: {
            type: String,
            default: ''
        },
        zip: {
            type: String,
            default: ''
        },
        city: {
            type: String,
            default: ''
        },
        country: {
            type: String,
            default: ''
        }
    },
    {
        timestamps: true,
    }
);

userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

userSchema.set('toJSON', {
    virtuals: true,
});

exports.User = mongoose.model('User', userSchema);
exports.userSchema = userSchema;