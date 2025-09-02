import mongoose from "mongoose";
import BusinessInformation from "../models/businessInformation.model.js";
import Owner from "../models/Owner.model.js";
import Product from "../models/products.model.js";
import { uploadFileOnCloudinary, deleteImageFromCloudinary, updateImageOnCloudinary } from "../utils/cloudinary.js";
import { error } from "console";

// const createProduct = async (req, res) => {
//   console.log("Request body:", req.body);
//   console.log("Request file:", req.file);
//   console.log("Request files:", req.files);

//   try {
//     const { name, costPrice, salesPrice, category, description, stockQuantity, barcode } = req.body;

//     // Image optional handling
//     let imageData = { url: "", id: "" };
//     if (req.file) {
//       const imageUrl = await uploadFileOnCloudinary(req.file.buffer, req.file.originalname);
//       if (!imageUrl) {
//         return res.status(400).json({ message: 'Failed to upload image to Cloudinary' });
//       }
//       imageData = {
//         url: imageUrl.secure_url || "",
//         id: imageUrl.public_id || ""
//       };
//     }

//     const business = await BusinessInformation.findOne({ owner: req.user._id });
//     if (!business) {
//       return res.status(404).json({ message: 'Business not found' });
//     }

//     const product = new Product({
//       name,
//       costPrice,
//       salesPrice,
//       category,
//       description,
//       business: business._id,
//       image: imageData, // Optional image
//       stockQuantity,
//       barcode
//     });

//     const savedProduct = await product.save();

//     res.status(201).json({
//       message: 'Product created successfully',
//       product: savedProduct
//     });
//   } catch (error) {
//     console.error('Error creating product:', error);
//     res.status(500).json({ message: 'Server error. Unable to create product.' });
//   }
// };

const createProduct = async (req, res) => {
  try {
    let { limit, products } = req.body;

    if (products && !Array.isArray(products)) {
      products = [products];
    }

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "At least one product is required", success: false });
    }

    if (limit && products.length > limit) {
      return res.status(400).json({
        message: `You can only add up to ${limit} product at once`,
        success: false
      })
    }

    const business = await BusinessInformation.findOne({ owner: req.user._id });
    if (!business) {
      return res.status(404).json({ message: "Business not found", success: false });
    }

    const productDocs = products.map((p) => ({
      name: p.name,
      costPrice: p.costPrice,
      salesPrice: p.salesPrice,
      category: p.category || "",
      description: p.description || "",
      business: business._id,
      stockQuantity: p.stockQuantity,
      barcode: p.barcode,
      supplier:p.supplier
    }));

    const savedProducts = await Product.insertMany(productDocs);

    res.status(201).json({
      message: `${savedProducts.length} product(s) created successfully`,
      products: savedProducts,
      success: true
    });

  } catch (error) {
    console.error("Error creating product(s):", error);
    res.status(500).json({ message: "Server error. Unable to create product(s).", success: false });
  }
}

// const getProducts = async (req, res) => {
//   try {
//     let page = Number(req.query.page) || 1;
//     let limit = Number(req.query.limit) || 6;
//     let skip = (page - 1) * limit;
//     let searchQuery = req.query.search || '';
//     let categoryFilter = req.query.category || '';

//     const business = await BusinessInformation.findOne({ owner: req.user._id });
//     if (!business) {
//       return res.status(404).json({ message: 'Business not found.' });
//     }

//     let filter = {
//       business: business._id
//     };

//     if (searchQuery) {
//       filter.name = { $regex: searchQuery, $options: 'i' };
//     }

//     if (categoryFilter) {
//       filter.category = categoryFilter;
//     }

//     const totalProducts = await Product.countDocuments(filter);
//     const products = await Product.find(filter)
//       .skip(skip)
//       .limit(limit)
//       .populate("category", "name");

//     if (products.length === 0) {
//       return res.status(404).json({ message: 'No products found.' });
//     }

//     res.status(200).json({
//       message: 'Products retrieved successfully',
//       currentPage: page,
//       totalPages: Math.ceil(totalProducts / limit),
//       totalProducts,
//       products
//     });

//   } catch (error) {
//     console.error('Error fetching products:', error);
//     res.status(500).json({ message: 'Server error. Unable to fetch products.' });
//   }
// };


const getProducts = async (req, res) => {
  try {
    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 6;
    let skip = (page - 1) * limit;
    let searchQuery = req.query.search || '';
    let categoryFilter = req.query.category || '';
    let supplierFilter = req.query.supplier || '';
    let stockStatusFilter = req.query.stockStatus || '';

    const business = await BusinessInformation.findOne({ owner: req.user._id });
    if (!business) {
      return res.status(404).json({ message: 'Business not found.' });
    }

    let filter = {
      business: business._id
    };

    if (searchQuery) {
      filter.name = { $regex: searchQuery, $options: 'i' };
    }

    if (categoryFilter) {
      filter.category = categoryFilter;
    }

    if (supplierFilter) {
      filter.supplier = supplierFilter;
    }

    if (stockStatusFilter) {
      if (stockStatusFilter === 'inStock') {
        filter.stockQuantity = { $gt: 5 };
      } else if (stockStatusFilter === 'lowStock') {
        filter.stockQuantity = { $gt: 0, $lte: 5 };
      } else if (stockStatusFilter === 'outOfStock') {
        filter.stockQuantity = { $eq: 0 };
      }
    }

    const totalProducts = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .skip(skip)
      .limit(limit)
      .populate("category", "name")
      .populate("supplier", "name");

    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found.' });
    }

    res.status(200).json({
      message: 'Products retrieved successfully',
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
      products
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error. Unable to fetch products.' });
  }
};

const getProductsById = async (req, res) => {
  try {
    const productId = req.params.productId;

    const business = await BusinessInformation.findOne({ owner: req.user._id });
    const getProductDetails = await Product.findOne({ _id: productId, business: business._id }).populate("category", "name");

    if (!getProductDetails) {
      return res.status(404).json({
        message: "No Product Found",
        success: false
      })
    }

    return res.status(200).json({
      message: "Product details retrieved successfully",
      product: getProductDetails,
      success: true
    })
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      success: false
    })
    console.log(`Error in getting Product Deatils:${error}`)
  }
}


// const getProductStats = async (req, res) => {
//   try {
//     console.log("User requesting stats:", req.user);

//     const business = await BusinessInformation.findOne({ owner: req.user._id });
//     if (!business) {
//       return res.status(404).json({ success: false, message: "Business not found" });
//     }

//     const businessId = new mongoose.Types.ObjectId(business._id);

//     const stats = await Product.aggregate([
//       { $match: { business: businessId } },
//       {
//         $group: {
//           _id: null,
//           totalProducts: { $sum: 1 },
//           totalStock: { $sum: { $ifNull: ["$stockQuantity", 0] } },
//           totalValue: {
//             $sum: {
//               $multiply: [
//                 { $ifNull: ["$salesPrice", 0] },
//                 { $ifNull: ["$stockQuantity", 0] }
//               ]
//             }
//           }
//         }
//       }
//     ]);

//     res.status(200).json({
//       success: true,
//       stats: stats[0] || { totalProducts: 0, totalStock: 0, totalValue: 0 }
//     });

//   } catch (error) {
//     console.error("Error fetching product stats:", error);
   
//   }
// };


// In your product controller
const getProductByBarCode = async (req, res) => {
  try {
    let { barcode } = req.params;

    // Trim and sanitize
    barcode = barcode.trim().replace(/[\n\r]+/g, "");

    const business = await BusinessInformation.findOne({ owner: req.user._id });
    if (!business) {
      return res.status(404).json({
        message: 'Business not found',
        success: false
      });
    }

    const product = await Product.findOne({
      barcode,
      business: business._id
    }).populate("category", "name");

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        success: false
      });
    }

    return res.status(200).json({
      message: "Product retrieved successfully",
      product,
      success: true
    });
  } catch (error) {
    console.log(`Error in fetching Products Details: ${error}`);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      success: false
    });
  }
};


const updateProductById = async (req, res) => {
  try {
    const productId = req.params.productId;

  
    const { name, costPrice, salesPrice, category, description, availability, barcode, stockQuantity,supplier } = req.body;

    const localImagePath = req?.files?.image?.[0]?.path || null;

    if (Object.keys(req.body).length === 0 && !localImagePath) {
      return res.status(400).json({
        message: "At least one field is required to update",
        success: false
      });
    }

    const business = await BusinessInformation.findOne({ owner: req.user._id });

    const existingProduct = await Product.findOne({ _id: productId, business: business._id });
    if (!existingProduct) {
      return res.status(400).json({ message: "Product Not Found", success: false });
    }

    if (localImagePath) {
      const imageUrl = await updateImageOnCloudinary(localImagePath, existingProduct.image?.id);
      if (imageUrl) {
        existingProduct.image.id = imageUrl.public_id;
        existingProduct.image.url = imageUrl.url;
      }
    }

  
    existingProduct.name = name || existingProduct.name;
    existingProduct.costPrice = costPrice || existingProduct.costPrice;
    existingProduct.salesPrice = salesPrice || existingProduct.salesPrice;
    existingProduct.category = category || existingProduct.category;
    existingProduct.description = description || existingProduct.description;
    existingProduct.barcode = barcode || existingProduct.barcode;
    existingProduct.availability = availability !== undefined ? availability : existingProduct.availability;
    existingProduct.stockQuantity = stockQuantity !== undefined ? stockQuantity : existingProduct.stockQuantity; 
    existingProduct.supplier=supplier!==undefined?supplier:existingProduct.supplier

    await existingProduct.save();

    return res.status(200).json({
      message: "Product Details Updated Successfully",
      product: existingProduct,
      success: true,
    });

  } catch (error) {
    console.log(`Error in updating product details: ${error}`);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      success: false
    });
  }
};


const deleteProductById = async (req, res) => {
  try {
    const productId = req.params.productId;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: "Invalid Product Id"
      })
    }
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(400).json({
        message: "Product Not Found"
      });
    }

    await deleteImageFromCloudinary(product.image.id);

    await Product.findByIdAndDelete(product._id);

    return res.status(200).json({
      message: "Product deleted successfully",
      success: true,
    })
  } catch (error) {
    console.log(`Error in deleting product:${error}`);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      success: false
    });
  }
}
const searchProduct = async (req, res) => {
  try {
    const { name } = req.query;
    console.log("Query:", name);

    if (!name) {
      return res.status(400).json({
        message: "Search query is missing.",
      });
    }


    const products = await Product.find({
      name: { $regex: name, $options: 'i' }

    });
    console.log("products:", products);

    if (products.length === 0) {
      return res.status(404).json({
        message: "No products found.",
      });
    }


    return res.status(200).json({
      message: "Products retrieved successfully",
      data: products,
    });
  } catch (error) {
    console.error(`Error in searching product: ${error}`);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}


const makeOffer = async (req, res) => {
  try {
    const { productId } = req.params
    const { offerPrice } = req.body;

    if (!productId || offerPrice === undefined) {
      return res.status(400).json({ accepted: false, message: "Product and offer price required." });
    }

    const business = await BusinessInformation.findOne({ owner: req.user._id });
    if (!business) return res.status(404).json({ accepted: false, message: "Business not found." });

    const product = await Product.findOne({ _id: productId, business: business._id });
    if (!product) return res.status(404).json({ accepted: false, message: "Product not found." });

    const minAcceptable = product.salesPrice * 0.5; // Example: minimum 50% of original price
    if (offerPrice >= product.salesPrice) {
      return res.status(200).json({ accepted: false, message: "Offer must be less than listed price." });
    }

    if (offerPrice < minAcceptable) {
      return res.status(200).json({ accepted: false, message: `Offer too low. Minimum allowed is Rs ${minAcceptable}` });
    }

    return res.status(200).json({
      accepted: true,
      finalPrice: offerPrice,
      message: "Offer accepted.",
      productId: product._id
    });

  } catch (error) {
    console.error("Error in making offer:", error);
    return res.status(500).json({ accepted: false, message: "Server error." });
  }
};

const getProductStatistic = async (req, res) => {
  try {
    const business = await BusinessInformation.findOne({ owner: req.user._id });
    if (!business) {
      return res.status(404).json({
        message: "No Business Found",
        success: false
      });
    }


    const stats = await Product.aggregate([
      { $match: { business: business._id } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: "$stockQuantity" },
          totalInventoryValue: {
            $sum: { $multiply: ["$salesPrice", "$stockQuantity"] }
          },
          lowStock: {
            $sum: {
              $cond: [
                { $and: [
                  { $gt: ["$stockQuantity", 0] },
                  { $lte: ["$stockQuantity", 5] }
                ]},
                1,
                0
              ]
            }
          },
          outOfStock: {
            $sum: {
              $cond: [{ $eq: ["$stockQuantity", 0] }, 1, 0]
            }
          }
        }
      }
    ]);

    return res.status(200).json({
      message: "All product stats retrieved successfully",
      success: true,
      stats: stats[0] || { 
        totalProducts: 0, 
        totalStock: 0, 
        totalInventoryValue: 0,
        lowStock: 0,
        outOfStock: 0 
      }
    });

  } catch (error) {
    console.error("Error in product statistic:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export {
  createProduct,
  getProducts,
  getProductsById,
  updateProductById,
  deleteProductById,
  searchProduct,
  getProductByBarCode,
  makeOffer,
  getProductStatistic,
  
}  