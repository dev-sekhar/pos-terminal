import * as Yup from 'yup';
export declare const productCategorySchema: Yup.ObjectSchema<{
    name: string;
    description: string | undefined;
    active: boolean;
}, Yup.AnyObject, {
    name: undefined;
    description: undefined;
    active: true;
}, "">;
export type ProductCategoryInput = Yup.InferType<typeof productCategorySchema>;
