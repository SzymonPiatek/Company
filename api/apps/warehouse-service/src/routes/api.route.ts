import { Router } from 'express';
import healthRoute from './health.route';
import warehouseLocationRoute from '@apps/warehouse-service/src/models/warehouseLocation/warehouseLocation.route';
import resourceLocationHistoryRoute from '@apps/warehouse-service/src/models/resourceLocationHistory/resourceLocationHistory.route';

const router = Router();

router.use('/health', healthRoute);

router.use('/warehouseLocations', warehouseLocationRoute);
router.use('/resourceLocationHistories/', resourceLocationHistoryRoute);

export default router;
