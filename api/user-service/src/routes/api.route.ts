import { Router } from 'express';
import healthRoute from './health.route';
import userRoute from '../models/user/user.route';

const router = Router();

router.use('/health', healthRoute);
router.use('/users', userRoute);

export default router;
