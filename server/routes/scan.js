import express from 'express';
import { logScan } from '../controllers/scan.js';

const router = express.Router();

router.post('/:slug', logScan);

export default router;
