import { Router } from 'express';
import IRLController from '../../controllers/irlController';
import { upload } from '../../helpers/utils';

const router = Router()

router.post('/', upload.single('image'), IRLController.createIrl);

export default router;