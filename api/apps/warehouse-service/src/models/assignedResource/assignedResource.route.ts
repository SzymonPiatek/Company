import { Router } from 'express';
import createAssignedResourceHandler from '../../models/assignedResource/handlers/createAssignedResource.handler';
import getAssignedResourcesHandler from '../../models/assignedResource/handlers/getAssignedResources.handler';
import getAssignedResourceByIdHandler from '../../models/assignedResource/handlers/getAssignedResourceById.handler';
import updateAssignedResourceHandler from '../../models/assignedResource/handlers/updateAssignedResource.handler';
import authMiddleware from '@libs/helpers/middlewares/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getAssignedResourcesHandler);
router.get('/:id', authMiddleware, getAssignedResourceByIdHandler);

router.post('/', authMiddleware, createAssignedResourceHandler);

router.patch('/:id', authMiddleware, updateAssignedResourceHandler);

export default router;
