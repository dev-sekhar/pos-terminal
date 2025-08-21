import * as Yup from 'yup';
export declare const userSchema: Yup.ObjectSchema<{
    name: string;
    email: string;
    password: string;
    role: string;
    branchId: number;
}, Yup.AnyObject, {
    name: undefined;
    email: undefined;
    password: undefined;
    role: undefined;
    branchId: undefined;
}, "">;
export type UserInput = Yup.InferType<typeof userSchema>;
