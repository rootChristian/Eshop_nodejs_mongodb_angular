/***********************************************************************
************ Author:    Christian KEMGANG NGUESSOP *********************
************ Version:    1.0.0                      ********************
***********************************************************************/

const mongoose = require('mongoose');

const categorySchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please provide unique category name"],
            unique: [true, "Category name exist"],
            minlength: 3,
            maxlength: 50
        },
        icon: {
            type: String,
        },
        color: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
);

categorySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

categorySchema.set('toJSON', {
    virtuals: true,
});

exports.Category = mongoose.model('Category', categorySchema);