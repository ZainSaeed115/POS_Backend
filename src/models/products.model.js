import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Color", "Size"
  options: [{ 
    value: { type: String, required: true }, // e.g., "Red", "XL"
    sku: { type: String },
    price: { type: Number, min: 0 },
    stock: { type: Number, default: 0 }
  }]
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sku: { type: String, unique: true, sparse: true },
  barcode: { type: String, unique: true, sparse: true },
  category: { 
    type: mongoose.Types.ObjectId,
    ref: "Category",
    required: true
  },
  brand: { type: String, trim: true },
  costPrice: { type: Number, required: true, min: 0 },
  salesPrice: { type: Number, required: true, min: 0 },
  discountPrice: { type: Number, min: 0 },
  business: { 
    type: mongoose.Types.ObjectId,
    ref: "BusinessInformation",
    required: true
  },
  description: { type: String, trim: true },
  specifications: { type: Map, of: String }, // Key-value pairs
  variants: [variantSchema],
  image: {
    url: { type: String },
    id: { type: String }
  },
  images: [{
    url: { type: String },
    id: { type: String }
  }],
  stockQuantity: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  taxRate: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  salesCount: { type: Number, default: 0 },
  tags: [{ type: String }],
  notes: { type: String }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for faster search
productSchema.index({ name: 'text', sku: 'text', barcode: 'text', tags: 'text' });
productSchema.index({ business: 1, category: 1, isActive: 1 });

// Virtual for profit calculation
productSchema.virtual('profit').get(function() {
  return this.salesPrice - this.costPrice;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.stockQuantity <= 0) return 'out';
  if (this.stockQuantity < this.lowStockThreshold) return 'low';
  return 'in';
});

const Product = mongoose.model('Product', productSchema);

export default Product;