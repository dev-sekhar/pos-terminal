import { Router } from 'express';
import * as salesController from '../controllers/salesController';
import { rbacMiddleware } from '../middleware/rbacMiddleware';
import { PERMISSIONS } from '@pos-terminal/permissions';

const router = Router();

// --- THIS IS THE FIX ---
// The core sales functions (creating and listing) should be protected by the same permission.
// Any user who can create sales should also be able to see the list of sales (which the service layer will filter for their branch).
const canAccessSales = rbacMiddleware(PERMISSIONS.CREATE_SALES);

router.post('/', canAccessSales, salesController.createSale);
router.get('/', canAccessSales, salesController.listSales); // Corrected permission
router.get('/utils/new-invoice', canAccessSales, salesController.getNewInvoiceNumber);

// Viewing a specific sale detail might be considered part of reporting
router.get('/:id', rbacMiddleware(PERMISSIONS.VIEW_REPORTS), salesController.getSaleById);

// Deleting a sale is a powerful action, restricted to managers and admins
const canManageSales = rbacMiddleware(PERMISSIONS.MANAGE_PRODUCTS); // Using as a proxy for manager-level access
router.put('/:id', canManageSales, salesController.updateSale);
router.delete('/:id', canManageSales, salesController.deleteSale);

export default router;