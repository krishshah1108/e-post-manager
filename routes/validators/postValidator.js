const Joi = require('joi');

const validateAddPost = Joi.object({
    caption: Joi.string().min(3).max(40).required(),
    post:Joi.string().default('No-image'),
});

const validateUpdatePost = Joi.object({
    caption: Joi.string().min(3).max(40).required()
});


module.exports = {validateAddPost , validateUpdatePost}