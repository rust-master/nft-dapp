import express from 'express';
import uploadRoute from './upload.route.js';

const router = express.Router();

// Mount upload endpoints
router.use('/upload', uploadRoute);

export default router;
