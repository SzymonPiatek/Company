import { Router } from 'express';
import healthRoute from './health.route';
import warehouseLocationRoute from '@apps/warehouse-service/src/models/warehouseLocation/warehouseLocation.route';

const router = Router();

router.use('/health', healthRoute);

router.use('/warehouseLocations', warehouseLocationRoute);

export default router;
