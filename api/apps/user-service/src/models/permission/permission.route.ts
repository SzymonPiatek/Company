import { Router } from 'express';
import getPermissionsHandler from '@apps/user-service/src/models/permission/handlers/getPermissions.handler';
import getPermissionByIdHandler from '@apps/user-service/src/models/permission/handlers/getPermissionById.handler';
import createPermissionHandler from '@apps/user-service/src/models/permission/handlers/createPermission.handler';
import updatePermissionHandler from '@apps/user-service/src/models/permission/handlers/updatePermission.handler';
import authMiddleware from '@libs/helpers/middlewares/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getPermissionsHandler);
router.get('/:id', authMiddleware, getPermissionByIdHandler);

router.post('/', authMiddleware, createPermissionHandler);

router.patch('/:id', authMiddleware, updatePermissionHandler);

export default router;
