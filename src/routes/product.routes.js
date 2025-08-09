import express from "express";
import { 
    createProduct ,
    getProducts,
    getProductsById,
    updateProductById,
    deleteProductById,
    searchProduct,
    getProductByBarCode
} from "../controllers/products.controller.js";
import { upload } from "../middleware/multer.js";
import {verifyJwt} from "../middleware/verifyToken.js"
import { validateBody } from "../middleware/validateSchema.js";
import { createProductSchema ,updateProductSchema} from "../utils/validations.js";

const router=express.Router();

router.post("/create",verifyJwt,upload.single("image")
,createProduct);
router.get("/get",verifyJwt,getProducts);
router.get('/search',searchProduct)
router.get("/:productId",verifyJwt,getProductsById);
router.get('/barcode/:barcode', verifyJwt,getProductByBarCode);
router.put("/update/:productId",verifyJwt,upload.fields([{
    name:"image"
}]),validateBody(updateProductSchema),updateProductById);
router.delete("/delete/:productId",verifyJwt,deleteProductById);


export default router;

