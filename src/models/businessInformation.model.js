import mongoose from "mongoose";

const BusinessInformationSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "Owner",
    required: true,
  },
  logo: {
    url: {
      type: String,
    },
    id: {
      type: String,
    },
  },
  businessType: {
    type: String,
    required: true,
  },
  businessContact: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["Active", "Inactive", "Suspended"],
    default: "Active",
  },
  location: {
    city: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      default: "Pakistan",
    },
  },
  businessHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String },
  },
  taxRate: Number,
  currency: String,

  // Optional: For location-based features like delivery zones
  coordinates: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    },
  },

  // Optional: To track verification status of the business
  isVerified: {
    type: Boolean,
    default: false,
  },
},
{
  timestamps: true,
}
);

// Optional: Index to speed up owner-based lookups
BusinessInformationSchema.index({ owner: 1 });

const BusinessInformation = mongoose.model(
  "BusinessInformation",
  BusinessInformationSchema
);

export default BusinessInformation;
