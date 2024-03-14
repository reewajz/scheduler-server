const Joi = require('joi');

const eventSchema = Joi.object().keys({
    title: Joi.string().min(2).max(100).required(),
    time: Joi.object().keys({
        hour: Joi.number().required(),
        minute: Joi.number(),
        second: Joi.number()        
    }),
    resources: Joi.array().items(Joi.object().keys({
        id: Joi.string().required(),
        name: Joi.string().required()
    })),
    organizationId: Joi.string().required(),
    duration: Joi.number().required(),
    date: Joi.number().required(),
    attendes: Joi.array().items(Joi.object().keys({
        id: Joi.string(),
        name: Joi.string().required()
    }))
})

exports.eventSchema = eventSchema;