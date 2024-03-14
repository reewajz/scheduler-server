const Joi = require('joi');

const resourceSchema = Joi.object().keys({
    name: Joi.string().min(2).max(50).required(),
    organizationId: Joi.string().required(),
    status: Joi.string(),
    available: Joi.object().keys({
        days: Joi.array().items(Joi.string()),
        end: Joi.object().keys({
            hour: Joi.number(),
            minute: Joi.number()
        }).required(),
        start: Joi.object().keys({
            hour: Joi.number(),
            minute: Joi.number()
        }).required()
    })
})

exports.resourceSchema = resourceSchema;