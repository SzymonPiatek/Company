import { Router } from 'express';
import healthRoute from './health.route';
import resourceLocationRoute from '../models/resourceLocation/resourceLocation.route';
import assignedResourceRoute from '../models/assignedResource/assignedResource.route';

const router = Router();

router.use('/health', healthRoute);
router.use('/resourceLocations', resourceLocationRoute);
router.use('/assignedResources', assignedResourceRoute);

export default router;
