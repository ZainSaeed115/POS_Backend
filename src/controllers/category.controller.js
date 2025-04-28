import Category from "../models/category.js";

const createCategory=async(req,res)=>{
 try {
    const {name}=req.body;
    const category= new  Category({
        name
    });
    await category.save();
    return res.status(201).json({
        message:"Category created Successfully",
        data:category
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
        const category= await Category.find({});
        if(!category){
            return res.status(404).json({
                message:"No Category Found"
            });
        }
        return res.status(200).json({
            message:"Categories retrieved successfully",
            data:category
        })
    } catch (error) {
        console.log(`Error in getting categories:${error}`);

    }
}

export {
    createCategory,
    getAllCategories
}