import { Router } from 'express';
import getResourceTypesHandler from './handlers/getResourcesType.handler';
import getResourceTypeByIdHandler from './handlers/getResourceTypeById.handler';

const router = Router();

router.get('/', getResourceTypesHandler);
router.get('/:id', getResourceTypeByIdHandler);

export default router;
