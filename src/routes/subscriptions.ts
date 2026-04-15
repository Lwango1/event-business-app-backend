import express from 'express';
import { createSubscription, getSubscription, renewSubscription, cancelSubscription } from '../controllers/subscriptionController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All subscription routes require authentication
router.use(authMiddleware);

// Sellers can create/manage their own subscriptions
router.post('/', requireRole(['seller']), createSubscription);
router.get('/', getSubscription);
router.put('/renew', requireRole(['seller']), renewSubscription);
router.put('/cancel', requireRole(['seller']), cancelSubscription);

export default router;