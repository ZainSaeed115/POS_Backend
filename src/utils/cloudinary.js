import {v2 as cloudinary} from "cloudinary"
import { error, log } from "console";
import fs from "fs"
import { Readable } from "stream";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});


const bufferToStream=(buffer)=>{
 const readable= new Readable();
 readable.push(buffer);
 readable.push(null);
 return readable;
}




const uploadFileOnCloudinary=async(fileBuffer,originalname)=>{
try {
  if(!fileBuffer) throw new Error("No file buffer provided");

  return new Promise((resolve,reject)=>{
   const uploadStream=cloudinary.uploader.upload_stream(
    {
        folder:"POS_Images",
        resource_type:"image",
        public_id:`img-${Date.now()}-${Math.round(Math.random()*1E9)}`,
        format:"webp",
       
    },
  (error,result)=>{
    if(error){
        reject(error);
    }
    else{
        resolve(result)
    }
  }
   );
   bufferToStream(fileBuffer).pipe(uploadStream);
  });
} catch (error) {
  console.error('Cloudinary upload error:', error);
    throw error;
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