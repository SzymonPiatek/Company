import { Router } from 'express';
import healthRoute from './health.route';
import userRoute from '../models/user/user.route';
import authRoute from '../models/auth/auth.route';

const router = Router();

router.use('/health', healthRoute);
router.use('/users', userRoute);
router.use('/auth', authRoute);

export default router;
