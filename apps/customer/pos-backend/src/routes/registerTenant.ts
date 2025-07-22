import { Router } from 'express';
import * as registerTenantController from '../controllers/registerTenantController';

const router = Router();

router.post('/', registerTenantController.registerTenant);

export default router; 