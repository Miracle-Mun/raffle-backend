import { Router } from 'express';
import escrowController from '../../controllers/escrowController';
const router = Router()

router.post('/deposit-coin-tx', escrowController.depositCoinTx);
router.post('/withdraw-coin-tx', escrowController.withdrawCoinTx);
router.post('/deposit-token-tx', escrowController.depositTokenTx);
router.post('/withdraw-token-tx', escrowController.withdrawTokenTx);

router.post('/deposit-coin', escrowController.depositCoin);
router.post('/withdraw-coin', escrowController.withdrawCoin);
router.post('/deposit-token', escrowController.depositToken);
router.post('/withdraw-token', escrowController.withdrawToken);

export default router;