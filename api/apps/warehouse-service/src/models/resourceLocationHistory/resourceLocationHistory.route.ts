import { Router } from 'express';
import getResourceLocationHistoriesHandler from '@apps/warehouse-service/src/models/resourceLocationHistory/handlers/getResourceLocationHistories.handler';

const router = Router();

router.get('/', getResourceLocationHistoriesHandler);

export default router;
