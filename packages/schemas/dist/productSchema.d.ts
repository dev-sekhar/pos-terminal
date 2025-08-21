import * as Yup from 'yup';
export declare const productSchema: Yup.ObjectSchema<{
    name: string;
    code: string;
    unit: string;
    price: number;
    productCategoryId: number;
    active: boolean;
}, Yup.AnyObject, {
    name: undefined;
    code: undefined;
    unit: undefined;
    price: undefined;
    productCategoryId: undefined;
    active: true;
}, "">;
export type ProductInput = Yup.InferType<typeof productSchema>;
