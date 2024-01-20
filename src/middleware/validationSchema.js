/***********************************************************************
************ Author:    Christian KEMGANG NGUESSOP *********************
************ Version:    1.0.0                      ********************
***********************************************************************/

const Joi = require("joi");

// Product validation
const addProductBodyValidation = (body) => {
    const schema = Joi.object({
        name: Joi.string().required().empty().min(3).max(50)
            .messages({
                "string.base": `"name" should be a type of 'text'`,
                "string.empty": `"name" cannot be an empty field`,
                "string.min": `"name" should have a minimum length of {#limit}`,
                "string.max": `"name" should have a maximum length of {#limit}`,
                "any.required": `"name" is a required field`
            }),
        description: Joi.string().required().empty().min(5).max(100)
            .messages({
                "string.base": `"description" should be a type of 'text'`,
                "string.empty": `"description" cannot be an empty field`,
                "string.min": `"description" should have a minimum length of {#limit}`,
                "string.max": `"description" should have a maximum length of {#limit}`,
                "any.required": `"description" is a required field`
            }),
        richDescription: Joi.string(),
        price: Joi.number().required().empty().min(1).max(1000)
            .messages({
                "string.base": `"price" should be a type of 'text'`,
                "string.empty": `"price" cannot be an empty field`,
                "string.min": `"price" should have a minimum length of {#limit}`,
                "string.max": `"price" should have a maximum length of {#limit}`,
                "any.required": `"price" is a required field`
            }),
        image: Joi.string().label("image").dataUri(),
        images: Joi.array().label("image").dataUri().items(Joi.string()),
        cloudinary_id: Joi.string(),
        size: Joi.array().items(Joi.string()),
        color: Joi.array().items(Joi.string()),
        category: Joi.string().required().empty()
            .messages({
                "string.base": `"category" should be a type of 'text'`,
                "string.empty": `"category" cannot be an empty field`,
                "any.required": `"category" is a required field`
            }),
        countInStock: Joi.number().required().empty().min(0).max(255)
            .messages({
                "string.base": `"countInStock" should be a type of 'text'`,
                "string.empty": `"countInStock" cannot be an empty field`,
                "string.min": `"countInStock" should have a minimum length of {#limit}`,
                "string.max": `"countInStock" should have a maximum length of {#limit}`,
                "any.required": `"countInStock" is a required field`
            }),
        rating: Joi.number(),
        isFeatured: Joi.boolean().label("disable")
    });
    return schema.validate(body);
};


module.exports = { addProductBodyValidation };
