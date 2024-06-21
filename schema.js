// server side validation //
/*  steps
  1- schema create 
  2 - app.js => required , 3- method create , 4-creat route ko as a middleware pass .(method).
*/
const Joi  = require("joi");
module.exports.listingSchema = Joi.object({
     listing : Joi.object({
     title:Joi.string().required(),
     description: Joi.string().required(),
     location:Joi.string().required(),
     country:Joi.string().required(),
     price:Joi.number().required().min(0),
     image:Joi.string().allow("" , null),
    }).required(),
})

module.exports.reviewSchema = Joi.object({
    review:Joi.object({
        name: Joi.string().required().max(20),
        rating : Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required(),
})
