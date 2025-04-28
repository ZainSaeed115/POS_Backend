import mongoose from "mongoose";
import joi from "joi"
const objectIdValidator=(value,helpers)=>{
if(!mongoose.Types.ObjectId.isValid(value)){
  return helpers.error("any.invalid");
}
return value
}

export const createProductSchema=joi.object({
 name:joi.string().trim().required().messages({
  'string.empty':'Product name is required'
 }),
 price:joi.number().min(0).required().messages({
  'number.base':'Price is required and must be a number',
  'number.min':'Price cannot be a negative',
 }),
 category:joi.string().custom(objectIdValidator).required().messages({
  'any.invalid':'Invalid category Id',
  'string.empty':'Category is required.'
 }),
 description:joi.string().optional().allow('').trim(),
 
});

export const updateProductSchema=joi.object({
  name: joi.string().trim().optional(),
  price: joi.number().min(0).optional(),
  category: joi.string().custom(objectIdValidator).optional(),
  description: joi.string().optional().allow('').trim(),
  availability: joi.boolean().optional(),
})