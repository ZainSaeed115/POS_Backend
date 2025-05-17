import express from "express";
import {
     createOrder,
     getOrders,
     getOrderById,
     deleteOrderById,
     getWeeklySales,
     getMonthlySales,
     getAllWeeksSales
    } from "../controllers/order.controller.js";
import {verifyJwt} from "../middleware/verifyToken.js"

const router=express.Router();

router.post("/create",verifyJwt,createOrder);
router.get("/weekly-sales",verifyJwt,getWeeklySales);
router.get("/allweeks-sales",verifyJwt,getAllWeeksSales)
router.get("/get",getOrders);
router.get("/:orderId",getOrderById);
// router.put("/update/:productId",updateProductById);
router.delete("/delete/:orderId",deleteOrderById)

export default router;

