const Joi = require('joi');

const validateStudentRegister = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email:Joi.string().email().required(),
    profilePhoto:Joi.string().default('null.jpg'),
    password:Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    confirmPassword:Joi.string().required().valid(Joi.ref('password'))
});

const validateStudentLogin = Joi.object({
    email:Joi.string().email().required(),
    password:Joi.string().required(),
});

const validateChangePassword = Joi.object({
    oldPassword:Joi.string().required(),
    newPassword:Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    confirmPassword:Joi.string().required().valid(Joi.ref('newPassword'))
});

const validateUpdateUser = Joi.object({
    name: Joi.string().min(3).max(30).optional(),
    profilePhoto:Joi.string().optional()
});


module.exports = {validateStudentRegister , validateStudentLogin , validateChangePassword , validateUpdateUser};