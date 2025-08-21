import * as Yup from 'yup';
export declare const userSchema: Yup.ObjectSchema<{
    email: string;
    password: string;
    name: string;
    role: string;
    branchId: number;
}, Yup.AnyObject, {
    email: undefined;
    password: undefined;
    name: undefined;
    role: undefined;
    branchId: undefined;
}, "">;
export type UserInput = Yup.InferType<typeof userSchema>;
