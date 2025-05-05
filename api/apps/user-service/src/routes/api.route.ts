import { Router } from 'express';
import userRoute from '@apps/user-service/src/models/user/user.route';
import authRoute from '@apps/user-service/src/models/auth/auth.route';
import roleRoute from '@apps/user-service/src/models/role/role.route';
import healthRoute from '@apps/user-service/src/routes/health.route';
import permissionRoute from '@apps/user-service/src/models/permission/permission.route';
import userRoleRoute from '@apps/user-service/src/models/userRole/userRole.route';

const router = Router();

router.use('/health', healthRoute);
router.use('/users', userRoute);
router.use('/auth', authRoute);
router.use('/roles', roleRoute);
router.use('/permissions', permissionRoute);
router.use('/userRole', userRoleRoute);

export default router;
