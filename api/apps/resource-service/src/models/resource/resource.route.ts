import { Router } from 'express';
import getResourcesHandler from './handlers/getResources.handler';
import getResourceByIdHandler from './handlers/getResourceById.handler';
import createResourceHandler from './handlers/createResource.handler';
import updateResourceHandler from './handlers/updateResource.handler';
import authMiddleware from '@libs/helpers/middlewares/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getResourcesHandler);
router.get('/:id', authMiddleware, getResourceByIdHandler);

router.post('/', authMiddleware, createResourceHandler);

router.patch('/:id', authMiddleware, updateResourceHandler);

export default router;
