import BusinessInformation from "../models/businessInformation.model.js";
import Customer from "../models/customer.model.js";
import DailySales from "../models/dailySaleSchema.model.js";
import Order from "../models/orders.model.js";
import Product from "../models/products.model.js";
import moment from "moment"
const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, paymentMethod} = req.body;

    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items found.', success: false });
    }

    
    // const validMethods = ['cash', 'credit card'];
    // if (!validMethods.includes(paymentMethod)) {
    //   return res.status(400).json({ message: 'Invalid payment method.', success: false });
    // }

   
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

      return {
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      };
    }));

    
    // let customer = await Customer.findOne({ email });
    // if (!customer) {
    //   customer = new Customer({
    //     name: `abc`,
    //     email:"abc@gmail.com",
    //     phone: phone || '',
    //     address: address || ''
    //   });
    //   await customer.save();
    // }

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
      // orderType,
      // servedBy: orderType === "Dine-In" ? servedBy : null,
      // address: orderType === "Home-Delivery" ? address : null
    });
    
    const savedOrder = await order.save();
  // ----------------------------
    // Update Daily Sales Tracking
    // ----------------------------
    const today= new Date().toISOString().split('T')[0];
    let dailySales= await DailySales.findOne({business:business._id,date:today});
    if(!dailySales){
      dailySales= new DailySales({
        business:business._id,
        date:today,
        totalOrders: 0,
        totalSales: 0,
        productBreakdown: [],
      })
    }

    dailySales.totalOrders += 1;
    dailySales.totalSales += totalAmount;
    enrichedItems.forEach((item)=>{
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

    await dailySales.save();

    res.status(201).json({
      message: 'Order created successfully',
      order: savedOrder,
      success: true
    });
  } catch (error) {
    console.error(`Error in createOrder: ${error.message}`);
    return res.status(500).json({
      message: "Something went wrong while creating order.",
      error: error.message,
      success: false
    });
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

};
