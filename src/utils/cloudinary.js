import {v2 as cloudinary} from "cloudinary"
import { log } from "console";
import fs from "fs"

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});


const uploadFileOnCloudinary=async(localFilePath)=>{
try {
    if(!localFilePath) return null;
    const response= await cloudinary.uploader.upload(localFilePath,{
        resource_type:'auto',
        folder:"POS_Images"
    });
    fs.unlinkSync(localFilePath);
    return response;
} catch (error) {
    fs.unlinkSync(localFilePath) 
    console.log(`Error in uploading file on cloudinary:${error}`);
    return null
}
}

const deleteImageFromCloudinary=async(productId)=>{
try {
    if(!productId) return null;
    const response= await cloudinary.uploader.destroy(productId);
    return response;
} catch (error) {
    console.log(`Error in Deleting Product:${error}`);
    return null;
}
}

const updateImageOnCloudinary=async(localFilePath,existingProductId)=>{
    try {
        if(!localFilePath) return null;
        if(existingProductId){
            await deleteImageFromCloudinary(existingProductId);
        }
        const response= await cloudinary.uploader.upload(localFilePath,{
            resource_type:'auto',
            folder:"POS_Images",
        });
       
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        console.log(`Error in updating file on Cloudinary: ${error}`);
        return null;
    }
}
export {uploadFileOnCloudinary,deleteImageFromCloudinary,updateImageOnCloudinary}