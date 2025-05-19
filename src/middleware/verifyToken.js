// middleware/verifyToken.js
import jwt from "jsonwebtoken";
import Owner from "../models/Owner.model.js";

export const verifyJwt = async (req, res, next) => {
  try {
 
    const token = req.cookies?.token || req.headers?.authorization?.replace("Bearer ", "");
    console.log('Incoming cookies:', req.cookies);
    console.log('Incoming headers:', req.headers);
    if (!token) {
      return res.status(401).json({
        message: "Authorization token missing",
        success: false
      });
    }
    
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
    
    const owner = await Owner.findById(decoded._id).select("-password");
    if (!owner) {
      return res.status(404).json({
        message: "User account not found",
        success: false
      });
    }

    req.user = owner;
    next();
    
  } catch (error) {
    console.error(`JWT verification error: ${error.message}`);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: "Session expired. Please login again",
        success: false
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: "Invalid authentication token",
        success: false
      });
    }

    return res.status(500).json({
      message: "Authentication failed",
      error: error.message,
      success: false
    });
  }
};