import mongoose from "mongoose";

const productBreakdownSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: String,
  orders: Number,
  revenue: Number,
});

const dailySalesSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  date: { type: Date, required: true },
  totalOrders: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  ProductBreakdown: [productBreakdownSchema]
}, { timestamps: true });

 const DailySales= mongoose.model('DailySales', dailySalesSchema);
 export default DailySales;
