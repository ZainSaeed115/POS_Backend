import express from "express";
import { createCategory,deleteCategory,getAllCategories, updateCategory } from "../controllers/category.controller.js";
import {verifyJwt} from "../middleware/verifyToken.js"
const router=express.Router();
router.post("/create",verifyJwt,createCategory);
router.get('/get',verifyJwt,getAllCategories);
router.put('/update-category/:categoryId',verifyJwt,updateCategory);
router.delete('/delete-category/:categoryId',verifyJwt,deleteCategory);
export default router;