import { Router } from 'express';
import getResourcesHandler from './handlers/getResources.handler';
import getResourceByIdHandler from './handlers/getResourceById.handler';

const router = Router();

router.get('/', getResourcesHandler);
router.get('/:id', getResourceByIdHandler);

export default router;
