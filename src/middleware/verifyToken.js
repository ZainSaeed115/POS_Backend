import jwt from "jsonwebtoken";
import Owner from "../models/Owner.model.js";


export const verifyJwt=async(req,res,next)=>{
  try {
    const token= req.cookies.token;
     console.log("tokens:"+token)
    if(!token){
     return res.status(401).json({
         message:"No tokens,Authorization denied"
     });
    }
 
    const decode=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET_KEY);
    if(!decode) return res.status(401).json({message:"Unauthorized - invalid token",success:false});

    console.log("ownerId:",decode._id);
    const owner=await Owner.findById(decode._id);
    console.log("Owner:",owner);
    if(!owner){
     return res.status(404).json({
         message:"No Owner found",
         status:false,
 
     });
    }
 
    req.user=owner;
    next();
    
  } catch (error) {
    console.log(`Error in verifying jwt:${error}`);
    return res.status(500).json({
        message:"Something went wrong",
        error:error.message,
        success:false
    });
  }
}