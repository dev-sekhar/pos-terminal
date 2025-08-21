import * as Yup from 'yup';
export declare const inventorySchema: Yup.ObjectSchema<{
    branchId: number;
    productId: number;
    stock: number;
    reorderLevel: number;
}, Yup.AnyObject, {
    branchId: undefined;
    productId: undefined;
    stock: undefined;
    reorderLevel: undefined;
}, "">;
export type InventoryInput = Yup.InferType<typeof inventorySchema>;
