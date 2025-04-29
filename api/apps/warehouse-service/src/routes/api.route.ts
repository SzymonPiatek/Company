import { Router } from 'express';
import healthRoute from './health.route';
import resourceLocationRoute from '@apps/warehouse-service/src/models/resourceLocation/resourceLocation.route';

const router = Router();

router.use('/health', healthRoute);
router.use('/resourceLocation', resourceLocationRoute);

export default router;
