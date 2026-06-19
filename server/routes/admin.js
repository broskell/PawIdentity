import express from 'express';
import { getUsers, getAnalytics, updateUserRole } from '../controllers/admin.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.get('/users', protect, getUsers);
router.get('/analytics', protect, getAnalytics);
router.put('/role', protect, updateUserRole);

export default router;
