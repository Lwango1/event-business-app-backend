import express from 'express';
import { register, registerOwner, registerSeller, login, getCurrentUser, updateProfile, getUsers, updateUser } from '../controllers/authController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Routes publiques
router.post('/register', register);
router.post('/login', login);
router.post('/owner', registerOwner);

// Routes protégées
router.get('/me', authMiddleware, getCurrentUser);
router.put('/profile', authMiddleware, updateProfile);

// Routes owner
router.post('/seller', authMiddleware, requireRole(['owner']), registerSeller);
router.get('/users', authMiddleware, requireRole(['owner']), getUsers);
router.patch('/users/:id', authMiddleware, requireRole(['owner']), updateUser);

export default router;
