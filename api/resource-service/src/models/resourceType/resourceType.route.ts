import { Router } from 'express';
import getResourceTypesHandler from './handlers/getResourcesType.handler';
import getResourceTypeByIdHandler from './handlers/getResourceTypeById.handler';
import createResourceTypeHandler from './handlers/createResourceType.handler';

const router = Router();

router.get('/', getResourceTypesHandler);
router.get('/:id', getResourceTypeByIdHandler);

router.post('/', createResourceTypeHandler);

export default router;
