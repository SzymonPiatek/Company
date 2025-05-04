import { Router } from 'express';
import getUsersHandler from './handlers/getUsers.handler';
import getUserByIdHandler from './handlers/getUserById.handler';
import createUserHandler from './handlers/createUser.handler';
import updateUserHandler from './handlers/updateUser.handler';
import authMiddleware from '@libs/helpers/middlewares/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getUsersHandler);
router.get('/:id', authMiddleware, getUserByIdHandler);

router.post('/', createUserHandler);

router.patch('/:id', authMiddleware, updateUserHandler);

export default router;
