import express from 'express';
import { createLiveSession, getLiveSessions, joinLiveSession, updateLiveSessionStatus } from '../controllers/liveSessionController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All live session routes require authentication
router.use(authMiddleware);

// Sellers can create live sessions
router.post('/', requireRole(['seller']), createLiveSession);

// Get live sessions (sellers see their own, others see public ones)
router.get('/', getLiveSessions);

// Join a live session
router.post('/:id/join', joinLiveSession);

// Sellers can update their session status
router.put('/:id/status', requireRole(['seller']), updateLiveSessionStatus);

export default router;