import * as Yup from "yup";
export declare const branchSchema: Yup.ObjectSchema<{
    name: string;
    tag: string;
    location: string | undefined;
    active: boolean;
}, Yup.AnyObject, {
    name: undefined;
    tag: undefined;
    location: undefined;
    active: true;
}, "">;
export type BranchInput = Yup.InferType<typeof branchSchema>;
