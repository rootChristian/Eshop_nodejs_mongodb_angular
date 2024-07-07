/***********************************************************************
************ Author:    Christian KEMGANG NGUESSOP *********************
************ Version:    1.0.0                      ********************
***********************************************************************/

const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Please provide unique username"],
            unique: [true, "Username exist"],
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
        firstname: {
            type: String,
            minlength: 3,
            maxlength: 50,
            default: null
        },
        lastname: {
            type: String,
            minlength: 3,
            maxlength: 50,
            default: null
        },
        phone: {
            type: String,
            required: true,
            minlength: 5,
            maxlength: 15
        },
        image: {
            type: String,
            default: null
        },
        cloudinary_id: {
            type: String,
            default: null
        },
        role: {
            type: String,
            minlength: 4,
            maxlength: 5,
            enum: ['ROOT', 'ADMIN', 'USER'],
            default: 'USER'
        },
        active: {
            type: Boolean,
            default: true
        },
        street: {
            type: String,
            default: null
        },
        apartment: {
            type: String,
            default: null
        },
        zip_code: {
            type: String,
            default: null
        },
        city: {
            type: String,
            default: null
        },
        country: {
            type: String,
            default: null
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

const User = mongoose.model('User', userSchema);
module.exports = User;
