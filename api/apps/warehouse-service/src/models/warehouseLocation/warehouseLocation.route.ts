import { Router } from 'express';
import getWarehouseLocationsHandler from '@apps/warehouse-service/src/models/warehouseLocation/handlers/getWarehouseLocations.handler';
import getWarehouseLocationByIdHandler from '@apps/warehouse-service/src/models/warehouseLocation/handlers/getWarehouseLocationById.handler';
import createWarehouseLocationHandler from '@apps/warehouse-service/src/models/warehouseLocation/handlers/createWarehouseLocation.handler';
import updateWarehouseLocationHandler from '@apps/warehouse-service/src/models/warehouseLocation/handlers/updateWarehouseLocation.handler';

const router = Router();

router.get('/', getWarehouseLocationsHandler);
router.get('/:id', getWarehouseLocationByIdHandler);

router.post('/', createWarehouseLocationHandler);

router.patch('/:id', updateWarehouseLocationHandler);

export default router;
