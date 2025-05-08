import { Router } from 'express';
import authMiddleware from '@libs/helpers/middlewares/auth.middleware';
import getRolesHandler from '@apps/user-service/src/models/role/handlers/getRoles.handler';
import getRoleByIdHandler from '@apps/user-service/src/models/role/handlers/getRoleById.handler';
import createRoleHandler from '@apps/user-service/src/models/role/handlers/createRole.handler';
import updateRoleHandler from '@apps/user-service/src/models/role/handlers/updateRole.handler';
import emptyBodyMiddleware from '@libs/helpers/middlewares/emptyBody.middleware';

const router = Router();

router.get('/', authMiddleware, getRolesHandler);
router.get('/:id', authMiddleware, getRoleByIdHandler);

router.post('/', authMiddleware, emptyBodyMiddleware, createRoleHandler);

router.patch('/:id', authMiddleware, emptyBodyMiddleware, updateRoleHandler);

export default router;
