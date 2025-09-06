import * as yup from 'yup';
export declare const paymentSchema: yup.ObjectSchema<{
    amount: number;
    method: "CARD" | "BANK" | "CASH";
    invoiceId: number;
}, yup.AnyObject, {
    amount: undefined;
    method: "CARD";
    invoiceId: undefined;
}, "">;
export declare const createPaymentValidation: (maxAmount?: number) => yup.ObjectSchema<{
    amount: number;
    method: "CARD" | "BANK" | "CASH";
    invoiceId: number;
}, yup.AnyObject, {
    amount: undefined;
    method: "CARD";
    invoiceId: undefined;
}, "">;
