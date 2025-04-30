import { Router } from 'express';
import createAssignedResourceHandler from '../../models/assignedResource/handlers/createAssignedResource.handler';
import getAssignedResourcesHandler from '../../models/assignedResource/handlers/getAssignedResources.handler';
import getAssignedResourceByIdHandler from '../../models/assignedResource/handlers/getAssignedResourceById.handler';
import updateAssignedResourceHandler from '../../models/assignedResource/handlers/updateAssignedResource.handler';

const router = Router();

router.get('/', getAssignedResourcesHandler);
router.get('/:id', getAssignedResourceByIdHandler);

router.post('/', createAssignedResourceHandler);

router.patch('/:id', updateAssignedResourceHandler);

export default router;
