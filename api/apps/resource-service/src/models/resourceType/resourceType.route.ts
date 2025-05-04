import { Router } from 'express';
import getResourceTypesHandler from './handlers/getResourceTypes.handler';
import getResourceTypeByIdHandler from './handlers/getResourceTypeById.handler';
import createResourceTypeHandler from './handlers/createResourceType.handler';
import editResourcesTypeHandler from './handlers/updateResourceType.handler';
import authMiddleware from '@libs/helpers/middlewares/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getResourceTypesHandler);
router.get('/:id', authMiddleware, getResourceTypeByIdHandler);

router.post('/', authMiddleware, createResourceTypeHandler);

router.patch('/:id', authMiddleware, editResourcesTypeHandler);

export default router;
