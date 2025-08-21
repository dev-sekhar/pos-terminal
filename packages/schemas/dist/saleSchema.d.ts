import * as Yup from 'yup';
declare const saleItemSchema: Yup.ObjectSchema<{
    productId: number;
    quantity: number;
    price: number;
    discount: number;
    tax: number;
}, Yup.AnyObject, {
    productId: undefined;
    quantity: undefined;
    price: undefined;
    discount: 0;
    tax: 0;
}, "">;
export declare const saleSchema: Yup.ObjectSchema<{
    invoice: string;
    total: number | undefined;
    discount: number;
    paymentType: string | undefined;
    datetime: Date;
    userId: number;
    branchId: number;
    items: {
        productId: number;
        price: number;
        quantity: number;
        discount: number;
        tax: number;
    }[];
    userName: string;
    status: "completed" | "pending" | "cancelled";
}, Yup.AnyObject, {
    invoice: undefined;
    total: undefined;
    discount: 0;
    paymentType: undefined;
    datetime: undefined;
    userId: undefined;
    branchId: undefined;
    items: "";
    userName: undefined;
    status: "completed";
}, "">;
export type SaleInput = Yup.InferType<typeof saleSchema>;
export type SaleItemInput = Yup.InferType<typeof saleItemSchema>;
export {};
