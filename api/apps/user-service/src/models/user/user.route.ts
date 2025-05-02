import { Router } from 'express';
import getUsersHandler from './handlers/getUsers.handler';
import getUserByIdHandler from './handlers/getUserById.handler';
import createUserHandler from './handlers/createUser.handler';
import updateUserHandler from './handlers/updateUser.handler';

const router = Router();

router.get('/', getUsersHandler);
router.get('/:id', getUserByIdHandler);

router.post('/', createUserHandler);

router.patch('/:id', updateUserHandler);

export default router;
