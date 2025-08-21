import * as Yup from 'yup';
export declare const purchaseSchema: Yup.ObjectSchema<{
    poNumber: string;
    datetime: Date;
    supplierId: number;
    branchId: number;
    items: {
        productId: number;
        quantity: number;
    }[];
    total: number | undefined;
    status: string;
}, Yup.AnyObject, {
    poNumber: undefined;
    datetime: undefined;
    supplierId: undefined;
    branchId: undefined;
    items: "";
    total: undefined;
    status: "completed";
}, "">;
export type PurchaseInput = Yup.InferType<typeof purchaseSchema>;
