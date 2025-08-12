import BusinessInformation from "../models/businessInformation.model.js";
import Owner from "../models/Owner.model.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { generateTokens,generateVerificationToken } from "../utils/commonFunctions.js";
import {sendVerificationEmail, sendWelcomeEmail,sendResetPasswordEmail} from "../mailer/mail.js"
const registerBusinessOwner=async(req,res)=>{
 try {
    const {name, email, phone,password}=req.body;
    console.log("Recieved Data:",req.body);
    if([name,email,phone,password].some((field)=>field?.trim()=="")){
        return res.status(400).json({
          message:"All fields are required"
        })
    }
  
    const findOwner= await Owner.findOne({email}).select("-password");
  
    if(findOwner){
       return res.status(400).json({
          message:"Email already exists",
          success:false
       })
    }
  
    
    const hashedPassword= await bcrypt.hash(password,10);
    const verificationToken= generateVerificationToken();
    const owner= new Owner({
      name,
      email,
      password:hashedPassword,
      phone,
      verificationToken:verificationToken
    });
  
    await owner.save();
    
   const token = generateTokens(owner._id,res);
   await sendVerificationEmail(owner.email,verificationToken);
   return res.status(201).json({
    message:"Owner registered successfully",
    owner:owner,
    token:token,
    success:true
   });
 } catch (error) {
    console.log(`Error in registering resturant owner:${error}`);
    return res.status(500).json({
        message:"Something went wrong",
        error:error.message,
        success:false
    });
 }
  
}
const Login=async (req,res)=>{
try {
    const {email,password}=req.body;

    if([email,password].some((fields)=>fields?.trim()=="")){
        return res.status(400).json({
            message:"All fields are required",
            success:false
        })
    }

    const owner= await Owner.findOne({email});
    if(!owner){
        return res.status(404).json({
            message:"User Not Found",
            success:true,
        });
    }

    const matchPassword= await bcrypt.compare(password,owner.password);
    if(!matchPassword){
        return res.status(400).json({
            message:"Invalid user credentials",
            success:false
        })
    }
    const token = await generateTokens(owner._id,res);

    return res.status(200).json({
        message:"User loggedIn successfully",
        owner:{
            ...owner._doc,
            password:undefined
        },
        token:token,
        success:true
    });


} catch (error) {
    console.log(`Error in Login:${error}`);
    return res.status(500).json({
        message:"Something went wrong",
        error:error.message
    })
}
}

const logout = async (req, res) => {
  try {
    res.clearCookie('token',{
  httpOnly: true,
  secure: true,
  sameSite: "none"
});
    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error logging out",
      error: error.message
    });
  }
};


const registerBusinessInformation = async (req, res) => {


    try {
        const { businessName, businessType, businessContact, city, country } = req.body;

    
        const existingBusiness = await BusinessInformation.findOne({ businessName,owner:req.user._id});
        if (existingBusiness) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Business name already exists under this owner",success:false });
        }

    
        const business = new BusinessInformation({
            businessName,
            businessType,
            businessContact,
            owner:req.user._id,
            location: { city, country },
        });

        await business.save();
      const owner= await Owner.findById(business.owner);
      if(!owner){
        return res.status(404).json({
          message:"Owner Not Found",
          success:false
        });
      }
      await sendWelcomeEmail(owner.email,owner.name,business.businessName," http://localhost:5173")
        return res.status(201).json({
            message: "Business Registered Successfully",
            business,
            success:true
        });

    } catch (error) {
       
        console.error(`Error in registering business: ${error.message}`);
        return res.status(500).json({ message: "Something went wrong", error: error.message ,success:false});
    } 
};

const verifyEmail=async (req,res)=>{
 try {
    const {verificationToken}=req.body;
    console.log("verificationToken",verificationToken);
    if(!verificationToken){
        return res.status(400).json({
            message:"Token required for verification"
        });
    }

    const owner=await Owner.findOne({_id:req.user._id,verificationToken:verificationToken});
    if(!owner){
       return res.status(404).json({
        message:"No Owner found",
        success:false
       })
    }
    owner.verificationToken=undefined;
    owner.isverified=true;
    await owner.save();
    return res.status(200).json({
        message:"Email verified successfully",
        success:true,
    });
 } catch (error) {
    console.log(`Error in verifying email:${error}`);
    return res.status(500).json({
        message:"Something went Wrong",
        error:error.message,
        success:false
    })
 }
}

const checkAuth=async (req,res)=>{
    try {
        const user=await Owner.findById(req.user._id).select("-password");
        if(!user){
            return res.status(404).json({
                message:"No User Found",
                success:false
            })
        }
        return res.status(200).json({
            user:user,
            success:true
        })
    } catch (error) {
        console.log(`Error in Checking User Auth:${error}`);
        return res.status(500).json({
            message:"Something Went Wrong",
            error:error.message
        })
    }
}
const getBusinessInformation = async (req, res) => {
    try {
        const businessId = req.params.businessId;
        
        const business = await BusinessInformation.findOne({_id:businessId,owner:req.user._id}).populate("owner", "name");

        if (!business) {
            return res.status(404).json({
                message: "Business Not Found",
                success:false
            });
        }
        return res.status(200).json({
            message: "Business information retrieved successfully",
            business: business,
            success:true
        });

    } catch (error) {
        console.error(`Error in registering business: ${error.message}`);

        return res.status(500).json({
            message: "Something went wrong",
            error: error.message,
            success:false
        });
    }
}

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    
    const normalizedEmail = email.toLowerCase().trim();
    
   
    const owner = await Owner.findOne({ email: normalizedEmail });
    
    if (owner) {
    
      const resetToken = generateVerificationToken();
      owner.verificationToken = resetToken;
      owner.verificationTokenExpiry = Date.now() + 3600000; 
      await owner.save();
      
     
      await sendResetPasswordEmail(owner.email, resetToken);
    }
    
   console.log("owner0:",owner)
    return res.status(200).json({
      message: "If your email exists in our system, you'll receive a reset link",
      owner:owner,
      success: true
    });
    
  } catch (error) {
    console.error('Error in forgetPassword:', error); 
    return res.status(500).json({
      message: "Something went wrong",
      error:  error.message ,
      success: false
    });
  }
}

const verifyResetPasswordToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    
    const owner = await Owner.findOne({
      verificationToken: token,
      verificationTokenExpiry:{$gt: Date.now() }
    });
   
    if (!owner) {
      return res.status(400).json({
        message: "Invalid or expired token",
        success: false
      });
    }

    return res.status(200).json({
      message: "Token verified successfully",
      success: true,
      ownerId: owner._id 
    });
    
  } catch (error) {
    console.error('Error in verifyResetPasswordToken:', error);
    return res.status(500).json({
      message: "Something went wrong",
      success: false
    });
  }
}

const resetPassword=async(req,res)=>{
  try {
    const {password,userId}=req.body;

    const hashedPassword= await bcrypt.hash(password,10);

    const owner = await Owner.findById(userId);
    if(!owner){
        return res.status(404).json({
            message:"User not exists",
            success:false
        })
    }

    owner.password=hashedPassword;
    owner.verificationToken=undefined;
    owner.verificationTokenExpiry=undefined;
    await owner.save();

    return res.status(200).json({
        message:"Password changed successfully",
        success:true
    })

  } catch (error) {
     console.error('Error in verifyResetPasswordToken:', error);
    return res.status(500).json({
      message: "Something went wrong",
      success: false
    });
  }
}
export { 
     registerBusinessInformation,
     getBusinessInformation,
     registerBusinessOwner,
     verifyEmail,
     checkAuth,
     Login,
     logout,
     forgetPassword,
     verifyResetPasswordToken,
     resetPassword
     };
