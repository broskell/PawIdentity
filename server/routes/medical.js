import express from 'express';
import { createMedicalRecord, getMedicalRecords } from '../controllers/medical.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', protect, createMedicalRecord);
router.get('/:petId', protect, getMedicalRecords);

export default router;
