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
 costPrice:joi.number().min(0).required().messages({
  'number.base':'Price is required and must be a number',
  'number.min':'Price cannot be a negative',
 }),
 salesPrice:joi.number().min(0).required().messages({
  'number.base':'Price is required and must be a number',
  'number.min':'Price cannot be a negative',
 }),
 stockQuantity:joi.number().min(0).required().messages(
 {
  'number.base':'Stock is required and must be a number',
  'number.min':'Stock cannot be a negative',
 }
 ),
 barcode:joi.string().trim().required().messages({
  'string.empty':'barcode is required'
 }),
 
 category:joi.string().custom(objectIdValidator).required().messages({
  'any.invalid':'Invalid category Id',
  'string.empty':'Category is required.'
 }),
 description:joi.string().optional().allow('').trim(),
 
});

export const updateProductSchema = joi.object({
  name: joi.string().trim().min(1).max(100).optional()
    .messages({
      'string.min': 'Name must be at least 1 character long',
      'string.max': 'Name cannot exceed 100 characters'
    }),
    
  costPrice: joi.number().min(0).precision(2).optional()
    .messages({
      'number.base': 'Cost price must be a number',
      'number.min': 'Cost price cannot be negative',
      'number.precision': 'Cost price can have max 2 decimal places'
    }),
    
  salesPrice: joi.number().min(0).precision(2).optional()
    .when('costPrice', {
      is: joi.exist(),
      then: joi.number().min(joi.ref('costPrice'))
        .message('Sales price should not be less than cost price')
    })
    .messages({
      'number.base': 'Sales price must be a number',
      'number.min': 'Sales price cannot be negative'
    }),
    
  stockQuantity: joi.number().min(0).optional().messages({
    'number.base': 'Stock is required and must be a number',
    'number.min': 'Stock cannot be a negative',
  }),
  
  category: joi.string().custom(objectIdValidator).optional()
    .messages({
      'string.base': 'Category must be a valid string'
    }),
    
  description: joi.string().max(1000).optional().allow('').trim()
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
    
  availability: joi.boolean().optional(),
  
  barcode: joi.string().trim().max(50).optional()
    .messages({
      'string.max': 'Barcode cannot exceed 50 characters'
    })
})

.min(1)
.messages({
  'object.min': 'At least one field is required for update'
});



// CREATE Supplier Validation
export const createSupplierSchema = joi.object({
  name: joi.string().trim().min(3).max(100).required().messages({
    "string.empty": "Supplier name is required",
    "string.min": "Name must be at least 3 characters",
    "string.max": "Name cannot exceed 100 characters",
  }),
  email: joi.string().trim().email().optional().allow("").messages({
    "string.email": "Invalid email format",
  }),
  phone: joi.string().trim().pattern(/^\d{10,15}$/).required().messages({
    "string.empty": "Phone number is required",
    "string.pattern.base": "Phone number must be 10 to 15 digits",
  }),
  address: joi.string().trim().max(200).optional().allow("").messages({
    "string.max": "Address cannot exceed 200 characters",
  }),
  productsSupplied: joi.array().items(joi.string()) ,// This expects strings).optional(),
  paymentTerms: joi.string()
    .valid("Pay Now", "Pay in 7 Days", "Pay in 30 Days")
    .optional(),
  balance: joi.number().min(0).required().messages({
    "number.base": "Balance must be a number",
    "any.required": "Balance is required",
  }),
  paymentStatus: joi.string().valid("PAID", "PENDING").optional(),
  notes: joi.string().trim().max(500).optional().allow("").messages({
    "string.max": "Notes cannot exceed 500 characters",
  }),
});

// UPDATE Supplier Validation
export const updateSupplierSchema = joi.object({
  name: joi.string().trim().min(3).max(100).optional().messages({
    "string.min": "Name must be at least 3 characters",
    "string.max": "Name cannot exceed 100 characters",
  }),
  email: joi.string().trim().email().optional().allow("").messages({
    "string.email": "Invalid email format",
  }),
  phone: joi.string().trim().pattern(/^\d{10,15}$/).optional().messages({
    "string.pattern.base": "Phone number must be 10 to 15 digits",
  }),
  address: joi.string().trim().max(200).optional().allow("").messages({
    "string.max": "Address cannot exceed 200 characters",
  }),
  productsSupplied: joi.array().items(
    joi.object({
      productId: joi.string().optional(),
      productName: joi.string().optional().allow(""),
    })
  ).optional(),
  paymentTerms: joi.string().valid("Pay Now", "Pay in 7 Days", "Pay in 30 Days").optional(),
  balance: joi.number().min(0).optional(),
  paymentStatus: joi.string().valid("PAID", "PENDING").optional(),
  notes: joi.string().trim().max(500).optional().allow("").messages({
    "string.max": "Notes cannot exceed 500 characters",
  }),
});
