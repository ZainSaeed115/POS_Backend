import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, 
    trim: true
  },
  category: {
    type: mongoose.Types.ObjectId,
    ref:"Category",
    required: true, 
    trim: true
  },
  costPrice: {
    type: Number,
    required: true, 
    min: [0, 'Price must be a positive number'],
  },
  salesPrice:{
    type: Number,
    required: true, 
    min: [0, 'Price must be a positive number'],
  },
  business: {
    type: mongoose.Types.ObjectId,
    ref: "BusinessInformation",
    required: true
  },
  description: {
    type: String, 
    trim: true,
    default: ''
  },
  image: {
    id: {
      type: String,
      default: ""
    },
    url: {
      type: String,
      default: ""
    }
  },
  availability: {
    type: Boolean,
    default: true, 
  },
  salesCount: {
    type: Number,
    default: 0
  },
  stockQuantity: {
    type: Number,
    default: 0
  },
  barcode: {
    type: String,
    unique: true,
    required:true,
    trim: true,
    sparse: true 
  },
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);

export default Product;
