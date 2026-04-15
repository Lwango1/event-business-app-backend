import express from 'express';
import * as invoiceController from '../controllers/invoiceController.js';

const router = express.Router();

router.get('/', invoiceController.getAllInvoices);
router.get('/client/:clientId', invoiceController.getInvoicesByClient);
router.put('/:id/status', invoiceController.updateInvoiceStatus);

export default router;
