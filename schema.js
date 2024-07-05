const Joi = require('joi');
 module.exports.listingSchema=Joi.object(
    {
    listing:Joi.object(
        {
            title:Joi.string().required(),
            price:Joi.number().required().min(0),
            description:Joi.string().required(),
            image:Joi.string().required(),
            country:Joi.string().required(),
            location:Joi.string().required()
        }
    ).required()
    }
);
//module.exports=listingSchema;


module.exports.review_Schema=Joi.object({
    review:Joi.object({
        rating:Joi.number().required().min(1).max(5),
        comment:Joi.string().required()
    }).required()
})