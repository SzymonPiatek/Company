import { Router } from 'express';
import getResourcesHandler from './handlers/getResources.handler';
import getResourceByIdHandler from './handlers/getResourceById.handler';
import createResourceHandler from './handlers/createResource.handler';

const router = Router();

router.get('/', getResourcesHandler);
router.get('/:id', getResourceByIdHandler);

router.post('/', createResourceHandler);

export default router;
