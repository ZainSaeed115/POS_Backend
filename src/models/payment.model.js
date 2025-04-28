const mongoose = require('mongoose');

// Create the Payment Schema
const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order', 
    required: true
  },
  amount: {
    type: Number,
    required: true, 
    min: 0 
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit card'], 
    required: true,
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['successful', 'failed', 'pending'], 
    default: 'pending'
  },
  paymentDate: {
    type: Date,
    default: Date.now 
  }
});

// Create the Payment model
const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
