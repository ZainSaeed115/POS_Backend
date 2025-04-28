import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['Manager', 'Cashier', 'Waiter', 'Chef', 'Cleaner', 'Delivery', 'Other'],
    default: 'Other',
    required: true
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    sparse: true // in case not every staff has email
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BusinessInformation",
    required: true
  },
  status: {
    type: String,
    enum: ["Active", "Inactive", "On Leave"],
    default: "Active"
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  profileImage: {
    id: {
      type: String,
      default: ""
    },
    url: {
      type: String,
      default: ""
    }
  },
  salary: {
    type: Number,
    default: 0
  },
  shift: {
    startTime: String,
    endTime: String
  },
  notes: String
}, {
  timestamps: true
});

const Staff = mongoose.model("Staff", staffSchema);

export default Staff;
