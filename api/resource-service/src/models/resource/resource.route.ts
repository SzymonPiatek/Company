import { Router } from 'express';
import getResourcesHandler from './handlers/getResources.handler';

const router = Router();

router.get('/', getResourcesHandler);

export default router;
