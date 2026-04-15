import express from 'express';
import * as productController from '../controllers/productController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', productController.getAllProducts);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/seller/:sellerId', productController.getProductsBySeller);
router.post('/', authMiddleware, requireRole(['seller', 'owner']), productController.createProduct);
router.put('/:id', authMiddleware, requireRole(['seller', 'owner']), productController.updateProduct);
router.delete('/:id', authMiddleware, requireRole(['seller', 'owner']), productController.deleteProduct);

export default router;
