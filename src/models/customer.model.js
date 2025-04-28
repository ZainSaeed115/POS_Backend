import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
  },
  phone: {
    type: String,
    match: [/^\d{10,15}$/, "Phone number should be 10-15 digits"],
  },
  address: {
    type: String,
    trim: true,
  },
  loyaltyPoints: {
    type: Number,
    default: 0,
  },
  totalSpent: {
    type: Number,
    default: 0,
  },
  lastVisitDate: {
    type: Date,
    default: Date.now,
  },
  visitCount: {
    type: Number,
    default: 1,
  }
}, { timestamps: true });

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;
