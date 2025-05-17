import express from "express";
import { checkAuth, getBusinessInformation, Login, registerBusinessInformation, registerBusinessOwner,verifyEmail, } from "../controllers/business.controller.js";
import { verifyJwt } from "../middleware/verifyToken.js";


const router = express.Router();
router.post('/login',Login);
router.post("/register_owner",registerBusinessOwner);
router.post("/register_business",verifyJwt,registerBusinessInformation);
router.get("/business_information",verifyJwt,getBusinessInformation);
router.post("/verify_email",verifyJwt,verifyEmail);
router.get("/check_auth",verifyJwt,checkAuth);
// router.post("/set_sales_password",verifyJwt,setSalesPassword)
// router.post("/verify_sales_password",verifyJwt,verifySalesPassword)
export default router;