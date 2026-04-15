import express from 'express';
import * as saleController from '../controllers/saleController.js';

const router = express.Router();

router.get('/', saleController.getAllSales);
router.post('/', saleController.createSale);
router.put('/:id/status', saleController.updateSaleStatus);

export default router;
