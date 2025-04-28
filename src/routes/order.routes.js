import express from "express";
import {
     createOrder,
     getOrders,
     getOrderById,
     deleteOrderById
    } from "../controllers/order.controller.js";
import {verifyJwt} from "../middleware/verifyToken.js"

const router=express.Router();

router.post("/create",verifyJwt,createOrder);
router.get("/get",getOrders);
router.get("/:orderId",getOrderById);
// router.put("/update/:productId",updateProductById);
router.delete("/delete/:orderId",deleteOrderById)

export default router;

