import express from "express";
import { createCategory,getAllCategories } from "../controllers/category.controller.js";

const router=express.Router();
router.post("/create",createCategory);
router.get('/get',getAllCategories);
export default router;