import { Router } from 'express';
import assignRoleHandler from '@apps/user-service/src/models/userRole/handlers/assignRole.handler';
import removeRoleHandler from '@apps/user-service/src/models/userRole/handlers/removeRole.handler';
import getUserRolesHandler from '@apps/user-service/src/models/userRole/handlers/getUserRoles.handler';
import authMiddleware from '@libs/helpers/middlewares/auth.middleware';

const router = Router();

router.get('/user/:userId', authMiddleware, getUserRolesHandler);

router.post('/user/:userId/role/:roleId', authMiddleware, assignRoleHandler);

router.delete('/user/:userId/role/:roleId', authMiddleware, removeRoleHandler);

export default router;
