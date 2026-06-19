import express from 'express';
import { createPet, getMyPets, getPetById, updatePet, deletePet } from '../controllers/pet.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, createPet)
  .get(protect, getMyPets);

router.route('/:id')
  .get(protect, getPetById)
  .put(protect, updatePet)
  .delete(protect, deletePet);

export default router;
