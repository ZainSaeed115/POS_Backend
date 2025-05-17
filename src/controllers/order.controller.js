import mongoose from "mongoose";
import BusinessInformation from "../models/businessInformation.model.js";
import Customer from "../models/customer.model.js";
import DailySales from "../models/dailySaleSchema.model.js";
import Order from "../models/orders.model.js";
import Product from "../models/products.model.js";
import moment from "moment"

const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items found.', success: false });
    }

    const business = await BusinessInformation.findOne({ owner: req.user._id });
    if (!business) {
      return res.status(404).json({ message: "Business not found.", success: false });
    }

    const enrichedItems = await Promise.all(items.map(async (item) => {
      if (!item.product || !item.quantity || item.quantity <= 0) {
        throw new Error('Each item must have a valid product and quantity > 0.');
      }

      const product = await Product.findById(item.product);
      if (!product) {
        throw new Error(`Product not found with ID: ${item.product}`);
      }

      // Check stock availability before proceeding
      if (product.stockQuantity < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product.name}. Available: ${product.stockQuantity}, Requested: ${item.quantity}`);
      }

      return {
        product: product._id,
        name: product.name,
        price: product.salesPrice,
        quantity: item.quantity
      };
    }));

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}`;

    // Create order
    const order = new Order({
      orderNumber,
      items: enrichedItems,
      totalAmount,
      business: business._id,
      paymentMethod,
      orderStatus: 'completed',
    });

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const savedOrder = await order.save({ session });

      // Update product stocks and sales counts
      await Promise.all(enrichedItems.map(async (item) => {
        await Product.findByIdAndUpdate(
          item.product,
          {
            $inc: {
              stockQuantity: -item.quantity, // Decrease stock
              // salesCount: item.quantity      // Increase sales count
            }
          },
          { session }
        );
      }));

      // Update Daily Sales Tracking
      const today = new Date().toISOString().split('T')[0];
      let dailySales = await DailySales.findOne({ business: business._id, date: today }).session(session);
      
      if (!dailySales) {
        dailySales = new DailySales({
          business: business._id,
          date: today,
          totalOrders: 0,
          totalSales: 0,
          ProductBreakdown: [],
        });
      }

      dailySales.totalOrders += 1;
      dailySales.totalSales += totalAmount;
      
      enrichedItems.forEach((item) => {
        const existing = dailySales.ProductBreakdown.find(p => p.product.equals(item.product));
        if (existing) {
          existing.orders += item.quantity;
          existing.revenue += item.price * item.quantity;
        } else {
          dailySales.ProductBreakdown.push({
            product: item.product,
            name: item.name,
            orders: item.quantity,
            revenue: item.price * item.quantity,
          });
        }
      });

      await dailySales.save({ session });

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
        message: 'Order created successfully',
        order: savedOrder,
        success: true,
        dailySales
      });

    } catch (error) {
      // If any error occurs, abort the transaction
      await session.abortTransaction();
      session.endSession();
      throw error;
    }

  } catch (error) {
    console.error(`Error in createOrder: ${error.message}`);
    return res.status(500).json({
      message: "Something went wrong while creating order.",
      error: error.message,
      success: false
    });
  }
};


const getWeeklySales = async (req, res) => {
  try {
    console.log("Starting to fetch weekly sales");
    const business = await BusinessInformation.findOne({ owner: req.user._id });
    
    if (!business) {
      return res.status(404).json({
        message: "Business Not Found",
        success: false
      });
    }
    
    const selectedWeek = req.query.week; // Get the week parameter from the query
    const startOfMonth = moment().startOf('month');
    const endOfMonth = moment().endOf('month');
    
    const getAllSales = await DailySales.find({
      business: business._id,
      date: {
        $gte: startOfMonth.toDate(),
        $lte: endOfMonth.toDate()
      }
    }).sort({ date: 1});
    
    console.log("Sales fetched:", getAllSales.length);

    const weeks = {
      week1: [],
      week2: [],
      week3: [],
      week4: []
    };

    getAllSales.forEach(sale => {
      const dayOfMonth = moment(sale.date).date();
      if (dayOfMonth <= 7) {
        weeks.week1.push(sale);
      } else if (dayOfMonth <= 14) {
        weeks.week2.push(sale);
      } else if (dayOfMonth <= 21) {
        weeks.week3.push(sale);
      } else {
        weeks.week4.push(sale);
      }
    });

    // If a specific week is requested, return it
    if (selectedWeek >= 1 && selectedWeek <= 4) {
      return res.status(200).json({
        success: true,
        month: moment().format('MMMM YYYY'),
        week: `week${selectedWeek}`,
        days: weeks[`week${selectedWeek}`]
      });
    }

    // If 'all' is requested, return all weeks of the month
    if (selectedWeek === 'all') {
      return res.status(200).json({
        success: true,
        month: moment().format('MMMM YYYY'),
        week: 'all',
        days: weeks
      });
    }

    // Handle invalid 'week' query
    return res.status(400).json({
      success: false,
      message: "Invalid week parameter. Please provide a valid week number or 'all'."
    });

  } catch (error) {
    console.log(`Error in getting weekly sales: ${error}`);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      status: false
    });
  }
};


const getAllWeeksSales = async (req, res) => {
  try {
    const business = await BusinessInformation.findOne({ owner: req.user._id });
    
    if (!business) {
      return res.status(404).json({
        message: "Business Not Found",
        success: false
      });
    }
    
    const startOfMonth = moment().startOf('month');
    const endOfMonth = moment().endOf('month');
    
    const allSales = await DailySales.find({
      business: business._id,
      date: {
        $gte: startOfMonth.toDate(),
        $lte: endOfMonth.toDate()
      }
    }).sort({ date: 1 });

    // Organize data by week
    const weeklyData = {
      week1: { sales: [], totalSales: 0, totalTransactions: 0 },
      week2: { sales: [], totalSales: 0, totalTransactions: 0 },
      week3: { sales: [], totalSales: 0, totalTransactions: 0 },
      week4: { sales: [], totalSales: 0, totalTransactions: 0 }
    };

    allSales.forEach(sale => {
      const dayOfMonth = moment(sale.date).date();
      let weekKey;
      
      if (dayOfMonth <= 7) {
        weekKey = 'week1';
      } else if (dayOfMonth <= 14) {
        weekKey = 'week2';
      } else if (dayOfMonth <= 21) {
        weekKey = 'week3';
      } else {
        weekKey = 'week4';
      }

      weeklyData[weekKey].sales.push(sale);
      weeklyData[weekKey].totalSales += sale.totalSales;
      weeklyData[weekKey].totalTransactions += sale.totalOrders;
    });

    // Format response with week numbers
    const response = [1, 2, 3, 4].map(weekNum => ({
      week: weekNum,
      sales: weeklyData[`week${weekNum}`].sales,
      totalSales: weeklyData[`week${weekNum}`].totalSales,
      totalTransactions: weeklyData[`week${weekNum}`].totalTransactions,
      averageSaleValue: weeklyData[`week${weekNum}`].totalTransactions > 0 
        ? weeklyData[`week${weekNum}`].totalSales / weeklyData[`week${weekNum}`].totalTransactions
        : 0
    }));

    return res.status(200).json({
      success: true,
      month: moment().format('MMMM YYYY'),
      weeks: response
    });

  } catch (error) {
    console.error(`Error in getAllWeeksSales: ${error.message}`);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      success: false
    });
  }
};

// In your sales.controller.js

// Add to sales.controller.js
const getMonthlySales = async (req, res) => {
  try {
    const business = await BusinessInformation.findOne({ owner: req.user._id });
    const startOfMonth = moment().startOf('month');
    const endOfMonth = moment().endOf('month');

    const allSales = await DailySales.find({
      business: business._id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // Organize by week
    const weeklyData = {
      week1: [],
      week2: [],
      week3: [],
      week4: []
    };

    allSales.forEach(sale => {
      const week = Math.ceil(moment(sale.date).date() / 7);
      weeklyData[`week${Math.min(week, 4)}`].push(sale);
    });

    res.status(200).json({
      success: true,
      month: moment().format('MMMM YYYY'),
      weeks: weeklyData
    });

  } catch (error) {
    console.error(`Error in getMonthlySales: ${error}`);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;
    
    const orders = await Order.find()
      .populate("items.product", "name price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments();
    res.status(200).json({
      orders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      totalOrders,
    });

  } catch (error) {
    console.log(`Error in getting orders: ${error}`);
    res.status(500).json({
      message: "Something went wrong while retrieving orders",
    });
  }

}

const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const orderDetails = await Order.findById(orderId)
      .populate("items.product", "name price")
    if (!orderDetails) {
      return res.status(404).json({
        message: "Order Not Found"
      })
    }
    return res.status(200).json({
      message: "Order Details retrieved Successfully",
      data: orderDetails
    })
  } catch (error) {
    console.log(`Error in getting Order details:${error}`);
  }
}

const deleteOrderById = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    console.log(orderId);

    const order = await Order.findByIdAndDelete(orderId);
    console.log(order)
    if (!order) {
      return res.status(404).json("Order Not Found")
    }
    return res.status(200).json({
      message: "Order deleted successfully"
    })
  } catch (error) {
    console.log(`Error in deleting product:${error}`);
  }
}
export {
  createOrder,
  getOrders,
  getOrderById,
  deleteOrderById,
  getWeeklySales,
  getMonthlySales,
  getAllWeeksSales
};
