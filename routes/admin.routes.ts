import express from 'express';
import { createProduct, deleteProduct, updateProduct }  from '../controllers/admin.controllers.js';
const router = express.Router();

router.post("/", createProduct);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;