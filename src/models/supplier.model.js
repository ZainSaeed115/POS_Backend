// Model: supplier.model.js
import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    business: { 
      type: mongoose.Types.ObjectId,
      ref: "BusinessInformation",
      required: [true, "Business reference is required"],
    },
    name: {
      type: String,
      required: [true, "Supplier name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    contactPerson: {
      type: String,
      trim: true,
      maxlength: [100, "Contact person cannot exceed 100 characters"],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s-]{7,15}$/, "Please enter a valid phone number"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email address"],
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, "Address cannot exceed 200 characters"],
    },
  },
  { timestamps: true }
);

const Supplier = mongoose.model("Supplier", supplierSchema);

export default Supplier;