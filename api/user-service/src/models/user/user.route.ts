import { Router } from 'express';
import getUsersHandler from './handlers/getUsers.handler';
import getUserByIdHandler from './handlers/getUserById.handler';
import createUserHandler from './handlers/createUser.handler';

const router = Router();

router.get('/', getUsersHandler);
router.get('/:id', getUserByIdHandler);

router.post('/', createUserHandler);

export default router;
