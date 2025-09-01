// Router: supplier.router.js (assuming file name)
import express from "express";
import { 
  createSupplier,
  getSuppliersDetails,
  getSupplierById,
  updateSupplier,
  deleteSupplier
} from "../controllers/supplier.controller.js";

import { verifyJwt } from "../middleware/verifyToken.js";

const router = express.Router();

router.post(
  "/create_supplier",
  verifyJwt,
  createSupplier
);

router.get("/get_suppliers_details", verifyJwt, getSuppliersDetails);

router.get("/get_supplier_details/:supplierId", verifyJwt, getSupplierById);

router.put(
  "/update_supplier_detail/:supplierId",
  verifyJwt,
  updateSupplier
);

router.delete("/delete/:supplierId", verifyJwt, deleteSupplier);

export default router;