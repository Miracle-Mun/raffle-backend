import { Router } from 'express';
import profileController from '../../controllers/profileController';
const router = Router()

router.get('/:id', profileController.getProfile);
router.post('/', profileController.createProfile);
// router.put('/:id', upload.single('image'), verifyAdmin(0), auctionController.updateAuction);
router.post('/:id', profileController.updateProfile);


export default router;