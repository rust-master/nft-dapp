import express from 'express';
import fileUpload from 'express-fileupload';
import controller from '../controllers/upload.controller.js';

const router = express.Router();
router.use(fileUpload({useTempFiles: true}));

router.route('/web3storage')
    .post(controller.web3StorageUpload);

export default router;