import jwt from "jsonwebtoken"

export const generateTokens=(ownerId,res)=>{
  try {
      const token=jwt.sign({
        _id:ownerId
      },
      process.env.ACCESS_TOKEN_SECRET_KEY,
      {
       expiresIn:"48h"
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // lowercase "production"
       sameSite: "none", // Corrected casing
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });
  return token;   
  } catch (error) {
    console.log(`Error in genrating tokens:${error}`);
  }
}

export const generateVerificationToken=()=>{
  return Math.floor(100000+Math.random()*900000).toString();
}
