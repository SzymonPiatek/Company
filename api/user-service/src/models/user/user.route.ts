import { Router } from 'express';
import getUsersHandler from './handlers/getUsers.handler';
import getUserByIdHandler from './handlers/getUserById.handler';

const router = Router();

router.get('/', getUsersHandler);
router.get('/:id', getUserByIdHandler);

export default router;
