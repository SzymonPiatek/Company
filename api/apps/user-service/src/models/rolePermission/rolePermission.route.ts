import { Router } from 'express';
import getRolePermissionsHandler from '@apps/user-service/src/models/rolePermission/handlers/getRolePermissions.handler';
import assignPermissionHandler from '@apps/user-service/src/models/rolePermission/handlers/assignPermission.handler';
import authMiddleware from '@libs/helpers/middlewares/auth.middleware';
import removePermissionHandler from '@apps/user-service/src/models/rolePermission/handlers/removePermission.handler';

const router = Router();

router.get('/role/:roleId', authMiddleware, getRolePermissionsHandler);

router.post('/role/:roleId/permission/:permissionId', authMiddleware, assignPermissionHandler);

router.delete('/role/:roleId/permission/:permissionId', authMiddleware, removePermissionHandler);

export default router;
