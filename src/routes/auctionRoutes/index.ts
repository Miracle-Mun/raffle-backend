import { Router } from 'express';
import auctionController from '../../controllers/auctionController';
import { upload } from '../../helpers/utils';
import { verifyAdmin } from '../../middlewares';
const router = Router()

router.get('/', auctionController.getAuctions);
router.get('/:id', auctionController.getAuction);
router.post('/', upload.single('image'), verifyAdmin(0), auctionController.createAuction);
router.put('/:id', upload.single('image'), verifyAdmin(0), auctionController.updateAuction);
router.post('/:id/delete', verifyAdmin(0), auctionController.deleteAuction);

export default router;