import express from 'express';
import { reportLost, getLostPets, reportFoundByFinder, closeLostCase } from '../controllers/lost.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, reportLost)
  .get(getLostPets);

router.post('/:petId/found', reportFoundByFinder);
router.post('/:petId/close', protect, closeLostCase);

export default router;
