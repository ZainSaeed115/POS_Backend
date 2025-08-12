import express from "express";
import { checkAuth, forgetPassword, getBusinessInformation, Login, logout, registerBusinessInformation, registerBusinessOwner,resetPassword,verifyEmail, verifyResetPasswordToken, } from "../controllers/business.controller.js";
import { verifyJwt } from "../middleware/verifyToken.js";


const router = express.Router();
router.post('/login',Login);
router.post("/register_owner",registerBusinessOwner);
router.post("/register_business",verifyJwt,registerBusinessInformation);
router.get("/business_information",verifyJwt,getBusinessInformation);
router.post("/verify_email",verifyJwt,verifyEmail);
router.get("/check_auth",verifyJwt,checkAuth);
router.post('/logout',verifyJwt,logout)
router.post("/forgot_password",forgetPassword);
router.post("/verify_token",verifyResetPasswordToken);
router.post("/reset_password",resetPassword);

// router.post("/set_sales_password",verifyJwt,setSalesPassword)
// router.post("/verify_sales_password",verifyJwt,verifySalesPassword)
export default router;