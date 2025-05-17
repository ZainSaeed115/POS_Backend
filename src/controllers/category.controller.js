import Category from "../models/category.js";
import Product from "../models/products.model.js"
import BusinessInformation from "../models/businessInformation.model.js"
const createCategory=async(req,res)=>{
 try {
    console.log("req:",req.body)
    const {name}=req.body;
    
    const business=await BusinessInformation.findOne({owner:req.user._id});
    if(!business){
        return res.status(400).json({
            message:"Business Not Found",
            success:false
        })
    }

    const category= new  Category({
        name,
        business:business._id
    });
    await category.save();
    return res.status(201).json({
        message:"Category created Successfully",
        data:category,
        success:true
    })
 } catch (error) {
    console.log(`Error in creating category:${error}`);
    return res.status(500).json({
        message:"Internal Server Error"
    })
 }
}
const getAllCategories=async(req,res)=>{
    try {
        const business= await BusinessInformation.findOne({
            owner:req.user._id
        })

        if(!business){
          return res.status(400).json({
            message:"Business Not Found",
            success:false
          })
        }
        const category= await Category.find({business:business._id});
        if(!category){
            return res.status(404).json({
                message:"No Category Found",
                success:false
            });
        }
        return res.status(200).json({
            message:"Categories retrieved successfully",
            data:category,
            success:true
        })
    } catch (error) {
        console.log(`Error in getting categories:${error}`);

    }
}

const updateCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { name } = req.body;
       
       
        if (!name) {
            return res.status(400).json({
                message: "Category name is required",
                success: false,
            });
        }

        const business= await BusinessInformation.findOne({owner:req.user._id});

        if(!business){
            return res.status(400).json({
                message:"Business Not Found",
                success:false
            })
        }

       
        const updatedCategory = await Category.findByIdAndUpdate(
            categoryId,
            { name,business:business._id },
            { new: true, runValidators: true }
        );

        // Check if category exists
        if (!updatedCategory) {
            return res.status(404).json({
                message: "Category not found",
                success: false,
            });
        }

        return res.status(200).json({
            message: "Category Updated Successfully",
            category: updatedCategory,
            success: true,
        });

    } catch (error) {
        console.error(`Error in updating category: ${error}`);
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
            success: false,
        });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        // Validate categoryId presence
        if (!categoryId) {
            return res.status(400).json({
                message: "Category ID is required",
                success: false,
            });
        }

        // Find business information for current user
        const business = await BusinessInformation.findOne({ owner: req.user._id });

        if (!business) {
            return res.status(404).json({
                message: "Business not found",
                success: false,
            });
        }

        // Check if any product is using this category for this business
        const isCategoryInUse = await Product.findOne({
            category: categoryId,
            business: business._id,
        });

        if (isCategoryInUse) {
            return res.status(400).json({
                message: "Cannot delete the category. It is assigned to products.",
                success: false,
            });
        }

        // Check if category exists before deleting
        const deletedCategory = await Category.findByIdAndDelete(categoryId);

        if (!deletedCategory) {
            return res.status(404).json({
                message: "Category not found",
                success: false,
            });
        }

        return res.status(200).json({
            message: "Category deleted successfully",
            success: true,
        });

    } catch (error) {
        console.error(`Error in deleting category: ${error}`);
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
            success: false,
        });
    }
};


export {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory
}