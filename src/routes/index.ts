import { Router } from 'express';
import authRoutes from './authRoutes';
import escrowRoutes from './escrowRoutes';
import auctionRoutes from './auctionRoutes';
import raffleRoutes from './raffleRoutes';
import userRoutes from './userRoutes';
import oauthRoutes from './oauthRoutes';
import profileRoutes from './profileRoutes';
import irlRoutes from './irlRoutes'

const router = Router()

router.use('/auth', authRoutes)
router.use('/oauth', oauthRoutes)
router.use('/escrow', escrowRoutes)
router.use('/auction', auctionRoutes)
router.use('/raffle', raffleRoutes)
router.use('/user', userRoutes)
router.use('/profile', profileRoutes)
router.use('/irl', irlRoutes)

export default router;