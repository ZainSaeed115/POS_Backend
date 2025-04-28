import mongoose from "mongoose";

const categorySchema= new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    business:{
        type:mongoose.Types.ObjectId,
        ref:"BusinessInformation",
        required:true
    }
})

const Category= mongoose.model("Category",categorySchema);
export default Category;