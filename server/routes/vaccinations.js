import express from 'express';
import { createVaccination, getVaccinations, verifyVaccination } from '../controllers/medical.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', protect, createVaccination);
router.get('/:petId', protect, getVaccinations);
router.put('/:id/verify', protect, verifyVaccination);

export default router;
