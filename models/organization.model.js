const Joi = require('joi');

const organizationSchema = Joi.object().keys({
    name: Joi.string().min(2).max(50).required()
})

exports.organizationSchema = organizationSchema;