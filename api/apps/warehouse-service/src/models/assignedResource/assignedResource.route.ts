import { Router } from 'express';
import createAssignedResourceHandler from '../../models/assignedResource/handlers/createAssignedResource.handler';

const router = Router();

router.post('/', createAssignedResourceHandler);

export default router;
