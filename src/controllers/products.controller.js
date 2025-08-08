import mongoose from "mongoose";
import BusinessInformation from "../models/businessInformation.model.js";
import Owner from "../models/Owner.model.js";
import Product from "../models/products.model.js";
import { uploadFileOnCloudinary,deleteImageFromCloudinary,updateImageOnCloudinary } from "../utils/cloudinary.js";
import { error } from "console";

const createProduct = async (req, res) => {
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    console.log("Request files:", req.files);

  try {
    const { name, costPrice, salesPrice, category, description, stockQuantity, barcode } = req.body;

    if (!req.file) {
      return res.status(400).json({ 
        success:false,
        message: 'Image file is required' ,
        error:"NO_FILE_PROVIDED"
      });
    }

    
    const imageUrl = await uploadFileOnCloudinary(req.file.buffer,req.file.originalname);
    
    if (!imageUrl) {
      return res.status(400).json({ message: 'Failed to upload image to Cloudinary' });
    }

    const business = await BusinessInformation.findOne({ owner: req.user._id });
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const product = new Product({
      name,
      costPrice,
      salesPrice,
      category,
      description,
      business: business._id,
      image: {
        url: imageUrl.secure_url,
        id: imageUrl.public_id
      },
      stockQuantity,
      barcode
    });

    const savedProduct = await product.save();

    res.status(201).json({
      message: 'Product created successfully',
      product: savedProduct
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error. Unable to create product.' });
  }
};

const getProducts = async (req, res) => {
  try {
    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 6;
    let skip = (page - 1) * limit;
    let searchQuery = req.query.search || '';

    
    const business = await BusinessInformation.findOne({ owner: req.user._id });
    if (!business) {
      return res.status(404).json({ message: 'Business not found.' });
    }
    console.log("business:",business._id)
    let filter = {
      business: business._id 
    };

    if (searchQuery) {
      filter.name = { $regex: searchQuery, $options: 'i' };
    }

    const totalProducts = await Product.countDocuments(filter);
    const products = await Product.find(filter).skip(skip).limit(limit).populate("category","name");

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



const getProductsById=async(req,res)=>{
  try {
    const productId=req.params.productId;
    
    const business= await BusinessInformation.findOne({owner:req.user._id});
    const getProductDetails= await Product.findOne({_id:productId,business:business._id}).populate("category","name");
    
    if(!getProductDetails){
      return res.status(404).json({
        message:"No Product Found",
        success:false
      })
    }

    return res.status(200).json({
      message:"Product details retrieved successfully",
      product:getProductDetails,
      success:true
    })
  } catch (error) {
    return res.status(500).json({
      message:"Internal Server Error",
      success:false
    })
    console.log(`Error in getting Product Deatils:${error}`)
  }
}  


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
   
    const { name, costPrice, salesPrice,category, description, availability, barcode} = req.body;

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
    existingProduct.costPrice= costPrice || existingProduct.costPrice;
    existingProduct.salesPrice= salesPrice || existingProduct.salesPrice;
    existingProduct.category = category || existingProduct.category;
    existingProduct.description = description || existingProduct.description;
    existingProduct.barcode=barcode||existingProduct.barcode;
    existingProduct.availability = availability !== undefined ? availability : existingProduct.availability;

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


const deleteProductById=async(req,res)=>{
try {
  const productId=req.params.productId;
  if(!mongoose.Types.ObjectId.isValid(productId)){
    return res.status(400).json({
      message:"Invalid Product Id"
    })
  }
  const product= await Product.findById(productId);

  if(!product){
    return res.status(400).json({
      message:"Product Not Found"
    });
  }

  await deleteImageFromCloudinary(product.image.id);

  await Product.findByIdAndDelete(product._id);
  
  return res.status(200).json({
    message:"Product deleted successfully",
    success:true,
  })
} catch (error) {
  console.log(`Error in deleting product:${error}`);
  return res.status(500).json({
    message:"Internal Server Error",
    error:error.message,
    success:false
  });
}
}
const searchProduct = async (req, res) => {
  try {
    const {name}= req.query;
    console.log("Query:",name);
    
    if (!name) {
      return res.status(400).json({
        message: "Search query is missing.",
      });
    }

   
    const products = await Product.find({
      name: { $regex: name, $options: 'i' } 

    });
    console.log("products:",products);
    
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
  }}
  
  
  


export {
    createProduct,
    getProducts,
    getProductsById,
    updateProductById,
    deleteProductById,
    searchProduct,
    getProductByBarCode
}  