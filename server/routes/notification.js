import express from 'express';
import { getNotifications, markAsRead } from '../controllers/notification.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markAsRead);

export default router;
