/***********************************************************************
************ Author:    Christian KEMGANG NGUESSOP *********************
************ Version:    1.0.0                      ********************
***********************************************************************/

const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

/// User validation
// Complexity required
const complexityOptions = {
    min: 8,
    max: 1024,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: 4,
};

/// User validation
const signUpBodyValidation = (body) => {
    const schema = Joi.object({
        username: Joi.string().min(3).max(50).alphanum().required()
            .messages({
                "string.base": `"username" should be a type of 'string'`,
                "string.empty": `"username" cannot be an empty field`,
                "string.min": `"username" should have a minimum length of {#limit}`,
                "string.max": `"username" should have a maximum length of {#limit}`,
                "any.required": `"username" is a required field`
            }),
        email: Joi.string().min(5).max(50).required()
            .email({ tlds: { allow: false } }) // Validate email format without allowing top-level domains
            .messages({
                "string.base": `"email" should be a type of 'string'`,
                "string.empty": `"email" cannot be an empty field`,
                "string.min": `"email" should have a minimum length of {#limit}`,
                "string.max": `"email" should have a maximum length of {#limit}`,
                "any.required": `"email" is a required field`
            }),
        password: passwordComplexity(complexityOptions).required()
            .messages({
                "string.base": `"password" should be a type of 'string'`,
                "string.empty": `"password" cannot be an empty field`,
                "string.min": `"password" should have a minimum length of {#limit}`,
                "string.max": `"password" should have a maximum length of {#limit}`,
                "any.required": `"password" is a required field`
            }),
        firstname: Joi.string().min(3).max(30).empty(null)
            .messages({
                "string.base": `"firstname" should be a type of 'string'`,
                "string.min": `"firstname" should have a minimum length of {#limit}`,
                "string.max": `"firstname" should have a maximum length of {#limit}`
            }),
        lastname: Joi.string().min(3).max(30).empty(null)
            .messages({
                "string.base": `"lastname" should be a type of 'string'`,
                "string.min": `"lastname" should have a minimum length of {#limit}`,
                "string.max": `"lastname" should have a maximum length of {#limit}`
            }),
        phone: Joi.string().min(5).max(15).required()
            .pattern(/^[0-9()+\-.\s]{5,15}$/) // Define a pattern for valid phone numbers
            .message('Please enter a valid phone number'),
        image: Joi.string().empty(null)
            .dataUri()
            .messages({
                'string.base': `"image" must be a string`
            }),
        cloudinary_id: Joi.string().empty(null)
            .messages({
                'string.base': `"cloudinary_id" must be a string`,
            }),
        role: Joi.string().min(4).max(5).valid('ROOT', 'ADMIN', 'USER').default('USER')
            .messages({
                'string.base': `"type" must be a string`,
                'string.min': `"type" must have at least {#limit} characters`,
                'string.max': `"type" must have at most {#limit} characters`,
                'any.only': `"type" must be one of 'ROOT', 'ADMIN', 'USER'`
            }),
        active: Joi.boolean().label("Active").valid(true, false).default(true),
        street: Joi.string().empty(null),
        apartment: Joi.string().empty(null),
        zip_code: Joi.string().empty(null),
        city: Joi.string().empty(null),
        country: Joi.string().empty(null)
    });
    return schema.validate(body);
};

const modifyUserBodyValidation = (body) => {
    const schema = Joi.object({
        username: Joi.string().min(3).max(50).alphanum()
            .messages({
                "string.base": `"username" should be a type of 'string'`,
                "string.empty": `"username" cannot be an empty field`,
                "string.min": `"username" should have a minimum length of {#limit}`,
                "string.max": `"username" should have a maximum length of {#limit}`
            }),
        email: Joi.string().min(5).max(50)
            .email({ tlds: { allow: false } }) // Validate email format without allowing top-level domains
            .messages({
                "string.base": `"email" should be a type of 'string'`,
                "string.empty": `"email" cannot be an empty field`,
                "string.min": `"email" should have a minimum length of {#limit}`,
                "string.max": `"email" should have a maximum length of {#limit}`
            }),
        password: passwordComplexity(complexityOptions)
            .messages({
                "string.base": `"password" should be a type of 'string'`,
                "string.empty": `"password" cannot be an empty field`,
                "string.min": `"password" should have a minimum length of {#limit}`,
                "string.max": `"password" should have a maximum length of {#limit}`
            }),
        firstname: Joi.string().min(3).max(30).empty(null)
            .messages({
                "string.base": `"firstname" should be a type of 'string'`,
                "string.min": `"firstname" should have a minimum length of {#limit}`,
                "string.max": `"firstname" should have a maximum length of {#limit}`
            }),
        lastname: Joi.string().min(3).max(30).empty(null)
            .messages({
                "string.base": `"lastname" should be a type of 'string'`,
                "string.min": `"lastname" should have a minimum length of {#limit}`,
                "string.max": `"lastname" should have a maximum length of {#limit}`
            }),
        phone: Joi.string().min(5).max(15)
            .pattern(/^[0-9()+\-.\s]{5,15}$/) // Define a pattern for valid phone numbers
            .message('Please enter a valid phone number'),
        image: Joi.string().empty(null)
            .dataUri()
            .messages({
                'string.base': `"image" must be a string`
            }),
        cloudinary_id: Joi.string().empty(null)
            .messages({
                'string.base': `"cloudinary_id" must be a string`,
            }),
        role: Joi.string().min(4).max(5).valid('ROOT', 'ADMIN', 'USER').default('USER')
            .messages({
                'string.base': `"type" must be a string`,
                'string.min': `"type" must have at least {#limit} characters`,
                'string.max': `"type" must have at most {#limit} characters`,
                'any.only': `"type" must be one of 'ROOT', 'ADMIN', 'USER'`
            }),
        active: Joi.boolean().label("Active").valid(true, false).default(true),
        street: Joi.string().empty(null),
        apartment: Joi.string().empty(null),
        zip_code: Joi.string().empty(null),
        city: Joi.string().empty(null),
        country: Joi.string().empty(null)
    });
    return schema.validate(body);
};

const getParamsUserValidation = (params) => {
    const schema = Joi.object({
        username: Joi.string().min(3).max(50).alphanum().required()
            .messages({
                "string.base": `"username" should be a type of 'string'`,
                "string.empty": `"username" cannot be an empty field`,
                "string.min": `"username" should have a minimum length of {#limit}`,
                "string.max": `"username" should have a maximum length of {#limit}`,
                "any.required": `"username" is a required field`
            }),
    });
    return schema.validate(params);
};

const signInBodyValidation = (body) => {
    const schema = Joi.object({
        username: Joi.string().min(3).max(50).alphanum().optional()
            .messages({
                "string.base": `"username" should be a type of 'string'`,
                "string.empty": `"username" cannot be an empty field`,
                "string.min": `"username" should have a minimum length of {#limit}`,
                "string.max": `"username" should have a maximum length of {#limit}`,
                "any.required": `"username" is a required field`
            }),
        email: Joi.string().min(5).max(50).optional()
            .email({ tlds: { allow: false } }) // Validate email format without allowing top-level domains
            .messages({
                "string.base": `"email" should be a type of 'string'`,
                "string.empty": `"email" cannot be an empty field`,
                "string.min": `"email" should have a minimum length of {#limit}`,
                "string.max": `"email" should have a maximum length of {#limit}`,
                "any.required": `"email" is a required field`
            }),
        password: passwordComplexity(complexityOptions).required()
            .messages({
                "string.base": `"password" should be a type of 'string'`,
                "string.empty": `"password" cannot be an empty field`,
                "string.min": `"password" should have a minimum length of {#limit}`,
                "string.max": `"password" should have a maximum length of {#limit}`,
                "any.required": `"password" is a required field`
            }),
    }).xor('email', 'username').messages({
        'object.missing': 'email or username is required'
    });
    return schema.validate(body);
};

const refreshTokenBodyValidation = (body) => {
    const schema = Joi.object({
        refreshToken: Joi.string()
            .required()
            .empty()
            .label("Refresh Token")
            .messages({
                "string.base": `"refreshToken" should be a type of 'text'`,
                "string.empty": `"refreshToken" cannot be an empty field`,
                "any.required": `"refreshToken" is a required field`
            })
    });
    return schema.validate(body);
};

/// Product validation 
const addProductBodyValidation = (body) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required()
            .messages({
                "string.base": `"name" should be a type of 'string'`,
                "string.empty": `"name" cannot be an empty field`,
                "string.min": `"name" should have a minimum length of {#limit}`,
                "string.max": `"name" should have a maximum length of {#limit}`,
                "any.required": `"name" is a required field`
            }),
        description: Joi.string().min(5).max(100).required()
            .messages({
                "string.base": `"description" should be a type of 'string'`,
                "string.empty": `"description" cannot be an empty field`,
                "string.min": `"description" should have a minimum length of {#limit}`,
                "string.max": `"description" should have a maximum length of {#limit}`,
                "any.required": `"description" is a required field`
            }),
        richDescription: Joi.string().empty(null)
            .messages({
                'string.base': `"richDescription" must be a string`,
            }),
        price: Joi.number().min(1).max(1000).required()
            .messages({
                "number.base": `"price" should be a type of 'number'`,
                "number.empty": `"price" cannot be an empty field`,
                "number.min": `"price" should have a minimum length of {#limit}`,
                "number.max": `"price" should have a maximum length of {#limit}`,
                "any.required": `"price" is a required field`
            }),
        image: Joi.string().empty(null)
            .dataUri()
            .messages({
                'string.base': `"image" must be a string`
            }),
        images: Joi.array().empty(null)
            .label("images")
            .items(Joi.string())
            .messages({
                'array.base': `"images" must be an array`
            }),
        cloudinary_id: Joi.string().empty(null)
            .messages({
                'string.base': `"cloudinary_id" must be a string`,
            }),
        size: Joi.array().empty(null)
            .items(Joi.string())
            .messages({
                'array.base': `"size" must be an array`
            }),
        color: Joi.array().empty(null)
            .items(Joi.string())
            .messages({
                'array.base': `"color" must be an array`
            }),
        category: Joi.string().required()
            .messages({
                "string.base": `"category" should be a type of 'string'`,
                "string.empty": `"category" cannot be an empty field`,
                "any.required": `"category" is a required field`
            }),
        countInStock: Joi.number().min(0).max(255).required()
            .messages({
                "number.base": `"countInStock" should be a type of 'number'`,
                "number.empty": `"countInStock" cannot be an empty field`,
                "number.min": `"countInStock" should have a minimum length of {#limit}`,
                "number.max": `"countInStock" should have a maximum length of {#limit}`,
                "any.required": `"countInStock" is a required field`
            }),
        rating: Joi.number().default(0)
            .messages({
                "number.base": `"rating" should be a type of 'number'`
            }),
        isFeatured: Joi.boolean().valid(true, false).default(false)
            .messages({
                'boolean.base': `"isFeatured" should be a boolean value`,
            })
    });
    return schema.validate(body);
};

const modifyProductBodyValidation = (body) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50)
            .messages({
                "string.base": `"name" should be a type of 'string'`,
                "string.empty": `"name" cannot be an empty field`,
                "string.min": `"name" should have a minimum length of {#limit}`,
                "string.max": `"name" should have a maximum length of {#limit}`
            }),
        description: Joi.string().min(5).max(100)
            .messages({
                "string.base": `"description" should be a type of 'string'`,
                "string.empty": `"description" cannot be an empty field`,
                "string.min": `"description" should have a minimum length of {#limit}`,
                "string.max": `"description" should have a maximum length of {#limit}`
            }),
        richDescription: Joi.string().empty(null)
            .messages({
                'string.base': `"richDescription" must be a string`,
            }),
        price: Joi.number().min(1).max(1000)
            .messages({
                "number.base": `"price" should be a type of 'number'`,
                "number.empty": `"price" cannot be an empty field`,
                "number.min": `"price" should have a minimum length of {#limit}`,
                "number.max": `"price" should have a maximum length of {#limit}`
            }),
        image: Joi.string().empty(null)
            .dataUri()
            .messages({
                'string.base': `"image" must be a string`
            }),
        images: Joi.array().empty(null)
            .label("images")
            .items(Joi.string())
            .messages({
                'array.base': `"images" must be an array`
            }),
        cloudinary_id: Joi.string().empty(null)
            .messages({
                'string.base': `"cloudinary_id" must be a string`,
            }),
        size: Joi.array().empty(null)
            .items(Joi.string())
            .messages({
                'array.base': `"size" must be an array`
            }),
        color: Joi.array().empty(null)
            .items(Joi.string())
            .messages({
                'array.base': `"color" must be an array`
            }),
        category: Joi.string()
            .messages({
                "string.base": `"category" should be a type of 'string'`,
                "string.empty": `"category" cannot be an empty field`,
                "any.required": `"category" is a required field`
            }),
        countInStock: Joi.number().min(0).max(255)
            .messages({
                "number.base": `"countInStock" should be a type of 'number'`,
                "number.empty": `"countInStock" cannot be an empty field`,
                "number.min": `"countInStock" should have a minimum length of {#limit}`,
                "number.max": `"countInStock" should have a maximum length of {#limit}`
            }),
        rating: Joi.number().default(0)
            .messages({
                "number.base": `"rating" should be a type of 'number'`
            }),
        isFeatured: Joi.boolean().valid(true, false).default(false)
            .messages({
                'boolean.base': `"isFeatured" should be a boolean value`,
            })
    });
    return schema.validate(body);
};

const getParamsProductValidation = (params) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required()
            .messages({
                "string.base": `"name" should be a type of 'string'`,
                "string.empty": `"name" cannot be an empty field`,
                "string.min": `"name" should have a minimum length of {#limit}`,
                "string.max": `"name" should have a maximum length of {#limit}`,
                "any.required": `"name" is a required field`
            }),
    });
    return schema.validate(params);
};

/// Category validation
const addCategoryBodyValidation = (body) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required()
            .messages({
                "string.base": `"name" should be a type of 'string'`,
                "string.empty": `"name" cannot be an empty field`,
                "string.min": `"name" should have a minimum length of {#limit}`,
                "string.max": `"name" should have a maximum length of {#limit}`,
                "any.required": `"name" is a required field`
            }),
                'string.base': `"icon" must be a string`,
        icon: Joi.string().empty(null)
            .messages({
                'string.base': `"icon" must be a string`,
            }),
        color: Joi.array().empty(null)
            .items(Joi.string())
            .messages({
                'array.base': `"color" must be an array`
            }),
        image: Joi.string().empty(null)
            .dataUri()
            .messages({
                'string.base': `"image" must be a string`
            }),
        cloudinary_id: Joi.string().empty(null)
            .messages({
                'string.base': `"cloudinary_id" must be a string`,
            }),
    });
    return schema.validate(body);
};

const modifyCategoryBodyValidation = (body) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50)
            .messages({
                "string.base": `"name" should be a type of 'string'`,
                "string.empty": `"name" cannot be an empty field`,
                "string.min": `"name" should have a minimum length of {#limit}`,
                "string.max": `"name" should have a maximum length of {#limit}`
            }),
        icon: Joi.string().empty(null)
            .messages({
                'string.base': `"icon" must be a string`,
            }),
        color: Joi.array().empty(null)
            .items(Joi.string())
            .messages({
                'array.base': `"color" must be an array`
            }),
        image: Joi.string().empty(null)
            .dataUri()
            .messages({
                'string.base': `"image" must be a string`
            }),
        cloudinary_id: Joi.string().empty(null)
            .messages({
                'string.base': `"cloudinary_id" must be a string`,
            }),
    });
    return schema.validate(body);
};

const getParamsCategoryValidation = (params) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required()
            .messages({
                "string.base": `"name" should be a type of 'string'`,
                "string.empty": `"name" cannot be an empty field`,
                "string.min": `"name" should have a minimum length of {#limit}`,
                "string.max": `"name" should have a maximum length of {#limit}`,
                "any.required": `"name" is a required field`
            }),
    });
    return schema.validate(params);
};

module.exports = { getParamsUserValidation, getParamsCategoryValidation, getParamsProductValidation,
                   signUpBodyValidation, addCategoryBodyValidation, addProductBodyValidation,
                   modifyUserBodyValidation, modifyCategoryBodyValidation, modifyProductBodyValidation,
                   signInBodyValidation, refreshTokenBodyValidation };
