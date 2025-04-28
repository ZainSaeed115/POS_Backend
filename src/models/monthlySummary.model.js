import mongoose from "mongoose";
const monthlySummarySchema = new mongoose.Schema({
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    month: { type: String, required: true }, // format: '2025-04'
    totalOrders: Number,
    totalSales: Number,
    productStats: [{
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      quantitySold: Number,
      sales: Number
    }],
    mostSoldProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    leastSoldProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
  }, { timestamps: true });
  
  const MonthlySalesSummary=mongoose.model('MonthlySalesSummary', monthlySummarySchema);
  export default MonthlySalesSummary;
  