import { Router } from 'express';
import raffleController from '../../controllers/raffleController';
import { upload } from '../../helpers/utils';
import { verifyAdmin } from '../../middlewares';

const router = Router()

router.get('/', raffleController.getRaffles);
router.get('/:id', raffleController.getRaffle);
router.post('/', upload.single('image'), verifyAdmin(1), raffleController.createRaffle);
router.put('/:id', upload.single('image'), verifyAdmin(1), raffleController.updateRaffle);
router.post('/:id/delete', verifyAdmin(1), raffleController.deleteRaffle);

export default router;