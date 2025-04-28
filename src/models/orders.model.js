import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true, 
    trim: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: String,
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  business: {
    type: mongoose.Types.ObjectId,
    ref: "BusinessInformation",
    required: true
  },
  // customer: {
  //   type: mongoose.Types.ObjectId,
  //   ref: "Customer",
  //   required: true
  // },
  totalAmount: {
    type: Number,
    required: true, 
    min: 0 
  },
  discount: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'unpaid', 'pending'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit card'],
    default: 'cash'
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'completed', 'canceled', 'in-progress'],
    default: 'pending'
  },
  orderType: {
    type: String,
    enum: ["Take-away", "Dine-In", "Home-Delivery"],
    default: "Dine-In"
  },
  notes: {
    type: String
  },
  isRefunded: {
    type: Boolean,
    default: false
  },
  servedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff" 
  },
  // if home deilvery
  address:{
    type:String
  }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
