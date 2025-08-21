import * as Yup from 'yup';
export declare const supplierSchema: Yup.ObjectSchema<{
    name: string;
    contact: string;
    email: string;
    address: string | undefined;
    active: boolean;
}, Yup.AnyObject, {
    name: undefined;
    contact: undefined;
    email: undefined;
    address: undefined;
    active: true;
}, "">;
export type SupplierInput = Yup.InferType<typeof supplierSchema>;
